#! /bin/bash

pre-commit install --install-hooks
pre-commit install --install-hooks --hook-type commit-msg

pip install codespell mkdocs mkdocs-material

npm install -g commitizen
npm install -g cz-conventional-changelog
npm install -g markdown-link-check
npm install -g markdownlint-cli2
npm install -g cdktf-cli@next

# Install the Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Install the Infracost CLI
curl -fsSL https://raw.githubusercontent.com/infracost/infracost/v0.10.13/scripts/install.sh | sh
