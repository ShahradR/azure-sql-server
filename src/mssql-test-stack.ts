import { MsSQLConstruct, MsSQLDatabaseConfig } from "./mssql-construct";
import { App, RemoteBackend, TerraformStack, TerraformVariable } from "cdktf";
import { Construct } from "constructs";
import {
  DataAzurermClientConfig,
  KeyVaultAccessPolicy,
} from "@cdktf/provider-azurerm";

class MsSQLStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new RemoteBackend(this, {
      hostname: "app.terraform.io",
      organization: "brokentech",
      workspaces: {
        name: "azure-sql-server",
      },
    });

    const serverName = new TerraformVariable(this, "serverName", {
      type: "string",
      description: "The name of the Microsoft SQL Server server.",
    });

    const keyVaultName = new TerraformVariable(this, "keyVaultName", {
      type: "string",
      description: "The name of the Microsoft SQL Server key vault.",
    });

    const resourceGroupName = new TerraformVariable(this, "resourceGroupName", {
      type: "string",
      description: "The name of the resource group.",
    });

    const administratorLogin = new TerraformVariable(
      this,
      "administratorLogin",
      {
        type: "string",
        description: "The administrator login for the Microsoft SQL server.",
        sensitive: true,
      }
    );

    const azureClientConfig = new DataAzurermClientConfig(this, "clientConfig");

    const keyVaultPolicy: KeyVaultAccessPolicy = {
      objectId: azureClientConfig.objectId,
      tenantId: azureClientConfig.tenantId,
      secretPermissions: ["Get", "List", "Set", "Delete", "Purge"],
    };

    const config: MsSQLDatabaseConfig = {
      serverName: serverName.value,
      keyVaultName: keyVaultName.value,
      resourceGroupName: resourceGroupName.value,
      administratorLogin: administratorLogin.value,
      keyVaultAccessPolicy: [keyVaultPolicy],
      tenantId: azureClientConfig.tenantId,
    };

    new MsSQLConstruct(this, "mssql", config);
  }
}

const app = new App();
new MsSQLStack(app, "cdktf");
app.synth(); // eslint-disable-line jest/require-hook
