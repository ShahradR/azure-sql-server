# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.202.3/containers/debian/.devcontainer/base.Dockerfile

# [Choice] Debian version (use bullseye or stretch on local arm64/Apple Silicon): bullseye, buster, stretch
ARG VARIANT="buster"
FROM mcr.microsoft.com/vscode/devcontainers/base:0-${VARIANT}

# ** [Optional] Uncomment this section to install additional packages. **
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends vim python3-pip

# Install tflint
RUN curl -s https://raw.githubusercontent.com/terraform-linters/tflint/v0.43.0/install_linux.sh | bash

RUN pip install pre-commit detect-secrets checkov
