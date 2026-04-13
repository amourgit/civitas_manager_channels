# MiniMax (CIVITAS plugin)

Bundled MiniMax plugin for both:

- API-key provider setup (`minimax`)
- Token Plan OAuth setup (`minimax-portal`)

## Enable

```bash
CIVITAS plugins enable minimax
```

Restart the Gateway after enabling.

```bash
CIVITAS gateway restart
```

## Authenticate

OAuth:

```bash
CIVITAS models auth login --provider minimax-portal --set-default
```

API key:

```bash
CIVITAS setup --wizard --auth-choice minimax-global-api
```

## Notes

- MiniMax OAuth uses a user-code login flow.
- OAuth currently targets the Token Plan path.
