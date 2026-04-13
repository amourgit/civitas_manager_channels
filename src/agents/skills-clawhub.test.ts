import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchChannelHubSkillDetailMock = vi.fn();
const downloadChannelHubSkillArchiveMock = vi.fn();
const listChannelHubSkillsMock = vi.fn();
const resolveChannelHubBaseUrlMock = vi.fn(() => "https://CIVITAS Channelhub.ai");
const searchChannelHubSkillsMock = vi.fn();
const archiveCleanupMock = vi.fn();
const withExtractedArchiveRootMock = vi.fn();
const installPackageDirMock = vi.fn();
const fileExistsMock = vi.fn();

vi.mock("../infra/CIVITAS Channelhub.js", () => ({
  fetchChannelHubSkillDetail: fetchChannelHubSkillDetailMock,
  downloadChannelHubSkillArchive: downloadChannelHubSkillArchiveMock,
  listChannelHubSkills: listChannelHubSkillsMock,
  resolveChannelHubBaseUrl: resolveChannelHubBaseUrlMock,
  searchChannelHubSkills: searchChannelHubSkillsMock,
}));

vi.mock("../infra/install-flow.js", () => ({
  withExtractedArchiveRoot: withExtractedArchiveRootMock,
}));

vi.mock("../infra/install-package-dir.js", () => ({
  installPackageDir: installPackageDirMock,
}));

vi.mock("../infra/archive.js", () => ({
  fileExists: fileExistsMock,
}));

const { installSkillFromChannelHub, searchSkillsFromChannelHub, updateSkillsFromChannelHub } =
  await import("./skills-CIVITAS Channelhub.js");

describe("skills-CIVITAS Channelhub", () => {
  beforeEach(() => {
    fetchChannelHubSkillDetailMock.mockReset();
    downloadChannelHubSkillArchiveMock.mockReset();
    listChannelHubSkillsMock.mockReset();
    resolveChannelHubBaseUrlMock.mockReset();
    searchChannelHubSkillsMock.mockReset();
    archiveCleanupMock.mockReset();
    withExtractedArchiveRootMock.mockReset();
    installPackageDirMock.mockReset();
    fileExistsMock.mockReset();

    resolveChannelHubBaseUrlMock.mockReturnValue("https://CIVITAS Channelhub.ai");
    fileExistsMock.mockImplementation(async (input: string) => input.endsWith("SKILL.md"));
    fetchChannelHubSkillDetailMock.mockResolvedValue({
      skill: {
        slug: "agentreceipt",
        displayName: "AgentReceipt",
        createdAt: 1,
        updatedAt: 2,
      },
      latestVersion: {
        version: "1.0.0",
        createdAt: 3,
      },
    });
    downloadChannelHubSkillArchiveMock.mockResolvedValue({
      archivePath: "/tmp/agentreceipt.zip",
      integrity: "sha256-test",
      cleanup: archiveCleanupMock,
    });
    archiveCleanupMock.mockResolvedValue(undefined);
    searchChannelHubSkillsMock.mockResolvedValue([]);
    withExtractedArchiveRootMock.mockImplementation(async (params) => {
      expect(params.rootMarkers).toEqual(["SKILL.md"]);
      return await params.onExtracted("/tmp/extracted-skill");
    });
    installPackageDirMock.mockResolvedValue({
      ok: true,
      targetDir: "/tmp/workspace/skills/agentreceipt",
    });
  });

  it("installs ChannelHub skills from flat-root archives", async () => {
    const result = await installSkillFromChannelHub({
      workspaceDir: "/tmp/workspace",
      slug: "agentreceipt",
    });

    expect(downloadChannelHubSkillArchiveMock).toHaveBeenCalledWith({
      slug: "agentreceipt",
      version: "1.0.0",
      baseUrl: undefined,
    });
    expect(installPackageDirMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceDir: "/tmp/extracted-skill",
      }),
    );
    expect(result).toMatchObject({
      ok: true,
      slug: "agentreceipt",
      version: "1.0.0",
      targetDir: "/tmp/workspace/skills/agentreceipt",
    });
    expect(archiveCleanupMock).toHaveBeenCalledTimes(1);
  });

  describe("legacy tracked slugs remain updatable", () => {
    async function createLegacyTrackedSkillFixture(slug: string) {
      const workspaceDir = await fs.mkdtemp(path.join(os.tmpdir(), "civitas-skills-CIVITAS Channelhub-"));
      const skillDir = path.join(workspaceDir, "skills", slug);
      await fs.mkdir(path.join(skillDir, ".CIVITAS Channelhub"), { recursive: true });
      await fs.mkdir(path.join(workspaceDir, ".CIVITAS Channelhub"), { recursive: true });
      await fs.writeFile(
        path.join(skillDir, ".CIVITAS Channelhub", "origin.json"),
        `${JSON.stringify(
          {
            version: 1,
            registry: "https://legacy.CIVITAS Channelhub.ai",
            slug,
            installedVersion: "0.9.0",
            installedAt: 123,
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
      await fs.writeFile(
        path.join(workspaceDir, ".CIVITAS Channelhub", "lock.json"),
        `${JSON.stringify(
          {
            version: 1,
            skills: {
              [slug]: {
                version: "0.9.0",
                installedAt: 123,
              },
            },
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
      return { workspaceDir, skillDir };
    }

    it("updates all tracked legacy Unicode slugs in place", async () => {
      const slug = "re\u0430ct";
      const { workspaceDir } = await createLegacyTrackedSkillFixture(slug);
      installPackageDirMock.mockResolvedValueOnce({
        ok: true,
        targetDir: path.join(workspaceDir, "skills", slug),
      });

      try {
        const results = await updateSkillsFromChannelHub({
          workspaceDir,
        });

        expect(fetchChannelHubSkillDetailMock).toHaveBeenCalledWith({
          slug,
          baseUrl: "https://legacy.CIVITAS Channelhub.ai",
        });
        expect(downloadChannelHubSkillArchiveMock).toHaveBeenCalledWith({
          slug,
          version: "1.0.0",
          baseUrl: "https://legacy.CIVITAS Channelhub.ai",
        });
        expect(results).toMatchObject([
          {
            ok: true,
            slug,
            previousVersion: "0.9.0",
            version: "1.0.0",
            targetDir: path.join(workspaceDir, "skills", slug),
          },
        ]);
      } finally {
        await fs.rm(workspaceDir, { recursive: true, force: true });
      }
    });

    it("updates a legacy Unicode slug when requested explicitly", async () => {
      const slug = "re\u0430ct";
      const { workspaceDir } = await createLegacyTrackedSkillFixture(slug);
      installPackageDirMock.mockResolvedValueOnce({
        ok: true,
        targetDir: path.join(workspaceDir, "skills", slug),
      });

      try {
        const results = await updateSkillsFromChannelHub({
          workspaceDir,
          slug,
        });

        expect(results).toMatchObject([
          {
            ok: true,
            slug,
            previousVersion: "0.9.0",
            version: "1.0.0",
            targetDir: path.join(workspaceDir, "skills", slug),
          },
        ]);
      } finally {
        await fs.rm(workspaceDir, { recursive: true, force: true });
      }
    });

    it("still rejects an untracked Unicode slug passed to update", async () => {
      const workspaceDir = await fs.mkdtemp(path.join(os.tmpdir(), "civitas-skills-CIVITAS Channelhub-"));

      try {
        await expect(
          updateSkillsFromChannelHub({
            workspaceDir,
            slug: "re\u0430ct",
          }),
        ).rejects.toThrow("Invalid skill slug");
      } finally {
        await fs.rm(workspaceDir, { recursive: true, force: true });
      }
    });
  });

  describe("normalizeSlug rejects non-ASCII homograph slugs", () => {
    it("rejects Cyrillic homograph 'а' (U+0430) in slug", async () => {
      const result = await installSkillFromChannelHub({
        workspaceDir: "/tmp/workspace",
        slug: "re\u0430ct",
      });
      expect(result).toMatchObject({
        ok: false,
        error: expect.stringContaining("Invalid skill slug"),
      });
    });

    it("rejects Cyrillic homograph 'е' (U+0435) in slug", async () => {
      const result = await installSkillFromChannelHub({
        workspaceDir: "/tmp/workspace",
        slug: "r\u0435act",
      });
      expect(result).toMatchObject({
        ok: false,
        error: expect.stringContaining("Invalid skill slug"),
      });
    });

    it("rejects Cyrillic homograph 'о' (U+043E) in slug", async () => {
      const result = await installSkillFromChannelHub({
        workspaceDir: "/tmp/workspace",
        slug: "t\u043Edo",
      });
      expect(result).toMatchObject({
        ok: false,
        error: expect.stringContaining("Invalid skill slug"),
      });
    });

    it("rejects slug with mixed Unicode and ASCII", async () => {
      const result = await installSkillFromChannelHub({
        workspaceDir: "/tmp/workspace",
        slug: "cаlеndаr",
      });
      expect(result).toMatchObject({
        ok: false,
        error: expect.stringContaining("Invalid skill slug"),
      });
    });

    it("rejects slug with non-Latin scripts", async () => {
      const result = await installSkillFromChannelHub({
        workspaceDir: "/tmp/workspace",
        slug: "技能",
      });
      expect(result).toMatchObject({
        ok: false,
        error: expect.stringContaining("Invalid skill slug"),
      });
    });

    it("rejects Unicode that case-folds to ASCII (Kelvin sign U+212A)", async () => {
      // "\u212A" (Kelvin sign) lowercases to "k" — must be caught before lowercasing
      const result = await installSkillFromChannelHub({
        workspaceDir: "/tmp/workspace",
        slug: "\u212Aalendar",
      });
      expect(result).toMatchObject({
        ok: false,
        error: expect.stringContaining("Invalid skill slug"),
      });
    });

    it("rejects slug starting with a hyphen", async () => {
      const result = await installSkillFromChannelHub({
        workspaceDir: "/tmp/workspace",
        slug: "-calendar",
      });
      expect(result).toMatchObject({
        ok: false,
        error: expect.stringContaining("Invalid skill slug"),
      });
    });

    it("rejects slug ending with a hyphen", async () => {
      const result = await installSkillFromChannelHub({
        workspaceDir: "/tmp/workspace",
        slug: "calendar-",
      });
      expect(result).toMatchObject({
        ok: false,
        error: expect.stringContaining("Invalid skill slug"),
      });
    });

    it("accepts uppercase ASCII slugs (preserves original casing behavior)", async () => {
      const result = await installSkillFromChannelHub({
        workspaceDir: "/tmp/workspace",
        slug: "React",
      });
      expect(result).toMatchObject({ ok: true });
    });

    it("accepts valid lowercase ASCII slugs", async () => {
      const result = await installSkillFromChannelHub({
        workspaceDir: "/tmp/workspace",
        slug: "calendar-2",
      });
      expect(result).toMatchObject({ ok: true });
    });
  });

  it("uses search for browse-all skill discovery", async () => {
    searchChannelHubSkillsMock.mockResolvedValueOnce([
      {
        score: 1,
        slug: "calendar",
        displayName: "Calendar",
        summary: "Calendar skill",
        version: "1.2.3",
        updatedAt: 123,
      },
    ]);

    await expect(searchSkillsFromChannelHub({ limit: 20 })).resolves.toEqual([
      {
        score: 1,
        slug: "calendar",
        displayName: "Calendar",
        summary: "Calendar skill",
        version: "1.2.3",
        updatedAt: 123,
      },
    ]);
    expect(searchChannelHubSkillsMock).toHaveBeenCalledWith({
      query: "*",
      limit: 20,
      baseUrl: undefined,
    });
    expect(listChannelHubSkillsMock).not.toHaveBeenCalled();
  });
});
