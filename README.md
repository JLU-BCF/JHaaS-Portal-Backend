# JHaaS Portal Backend

This repository contains the Code for the JHaaS Portal Backend.

## Gettings started

This repository contains a container configuration to allow development via tools like podman and docker. As podman and docker are handling user id mapping totally different, there are do compose files, one for each.

Depending of which tool you want to use, create a link to the compose file, e.g.:

```bash
# for docker
ln -s compose.docker.yml compose.yml

# for podman
ln -s compose.podman.yml compose.yml
```

If you also want to develop with a local authentik instance, `cd` into `authentik` and start the composition.
