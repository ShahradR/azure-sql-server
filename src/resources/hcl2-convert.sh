#! /bin/bash
cdktf get
cdktf synth
echo $(cat $GITHUB_WORKSPACE/cdktf.out/stacks/cdktf/cdk.tf.json | jq -f $GITHUB_WORKSPACE/src/resources/jq-filter.jq) > $GITHUB_WORKSPACE/cdktf.out/stacks/cdktf/cdk.tf.json

curl -SsL https://github.com/kvz/json2hcl/releases/download/v0.0.6/json2hcl_v0.0.6_linux_amd64 \
  | sudo tee /usr/local/bin/json2hcl > /dev/null && sudo chmod 755 /usr/local/bin/json2hcl && json2hcl -version

json2hcl < $GITHUB_WORKSPACE/cdktf.out/stacks/cdktf/cdk.tf.json > $GITHUB_WORKSPACE/cdktf.out/cdk.tf

terraform_dir=$(mktemp -d -t terraform-XXXXXX)

pushd $terraform_dir
    wget https://releases.hashicorp.com/terraform/0.12.31/terraform_0.12.31_linux_amd64.zip
    unzip terraform_0.12.31_linux_amd64.zip
    ./terraform init $GITHUB_WORKSPACE/cdktf.out/stacks/cdktf
    ./terraform 0.12upgrade --yes --force $GITHUB_WORKSPACE/cdktf.out/
    echo $GITHUB_WORKSPACE/cdktf.out/
popd
