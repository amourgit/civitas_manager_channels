# CIVITAS Channel Manager

Complete channel management system extracted from OpenClaw, customized for CIVITAS infrastructure.

## Overview

This repository contains the surgically extracted channel management components from OpenClaw, providing a standalone Channel Manager that can be integrated with custom gateways and agents.

## Features

- **Complete Channel Management**: All channel types, configurations, and runtime management
- **Extensible Plugin System**: Support for multiple channel extensions (Slack, Discord, Telegram, WhatsApp, etc.)
- **Channel Configuration**: Advanced channel setup, authentication, and policy management
- **Testing Suite**: Comprehensive tests for all channel functionality
- **CIVITAS Branded**: Fully customized and branded for CIVITAS infrastructure

## Architecture

The Channel Manager includes:

- `src/channels/` - Core channel management logic
- `src/agents/` - Channel-specific agent tools
- `src/cli/` - Command-line interface for channel management
- `src/commands/` - Channel setup and configuration commands
- `src/plugin-sdk/` - Plugin development SDK
- `extensions/` - Channel extensions (Slack, Discord, Telegram, etc.)
- `test/` - Comprehensive test suite

## Installation

```bash
npm install
```

## Usage

### CLI Commands

```bash
# List available channels
npm run civitas-channels list

# Setup a new channel
npm run civitas-channels setup <channel-type>

# Configure channel settings
npm run civitas-channels config <channel-id>
```

### Programmatic API

```typescript
import { ChannelManager } from './src/channels/manager';

const manager = new ChannelManager();
await manager.initialize();
```

## Supported Channels

- Slack
- Discord
- Telegram
- WhatsApp
- Microsoft Teams
- Matrix
- IRC
- And many more...

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build

# Development mode
pnpm dev
```

## Testing

The project includes comprehensive tests:

```bash
# Run all tests
pnpm test

# Run channel-specific tests
pnpm test:channels

# Run extension tests
pnpm test:extensions
```

## Integration

This Channel Manager is designed to integrate with:

- Custom CIVITAS Gateway
- Custom CIVITAS Agents
- Existing infrastructure

## License

MIT License - see LICENSE file for details.

## Contributing

This is a CIVITAS proprietary project. All contributions should follow CIVITAS development guidelines.
