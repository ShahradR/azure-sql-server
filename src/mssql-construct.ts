import { Construct } from "constructs";
import {
  Password,
  PasswordConfig,
  RandomProvider,
} from "@cdktf/provider-random";
import {
  AzurermProvider,
  ResourceGroup,
  KeyVault,
  KeyVaultSecret,
  MssqlServer,
  KeyVaultAccessPolicy,
} from "@cdktf/provider-azurerm";

/**
 * Configuration object for the SQL Server database construct.
 */
export interface MsSQLDatabaseConfig {
  readonly serverName: string;
  readonly keyVaultName: string;
  readonly resourceGroupName: string;
  readonly administratorLogin: string;
  readonly keyVaultAccessPolicy: Array<KeyVaultAccessPolicy>;
  readonly tenantId: string;
}

/**
 * Construct for creating a SQL Server database.
 */
export class MsSQLConstruct extends Construct {
  public readonly mssqlDatabaseRG: ResourceGroup;
  public readonly mssqlServer: MssqlServer;
  public readonly mssqlDatabaseVaultCredentials: KeyVault;
  public readonly mssqlDatabasePasswordSecret: KeyVaultSecret;
  public readonly mssqlDatabaseLoginSecret: KeyVaultSecret;

  constructor(scope: Construct, name: string, config: MsSQLDatabaseConfig) {
    super(scope, name);

    new AzurermProvider(this, "azureFeature", {
      features: {},
    });

    new RandomProvider(this, "random", {});

    const mssqlDatabasePassword = new Password(this, "mssqlDatabasePassword", {
      length: 16,
      special: true,
    } as PasswordConfig);

    this.mssqlDatabaseRG = new ResourceGroup(this, "mssqlDatabaseRG", {
      name: config.resourceGroupName,
      location: "canadacentral",
    });

    this.mssqlDatabaseVaultCredentials = new KeyVault(this, "mssqlKeyVault", {
      location: "canadacentral",
      name: config.keyVaultName,
      resourceGroupName: this.mssqlDatabaseRG.name,
      skuName: "standard",
      tenantId: config.tenantId,
      accessPolicy: config.keyVaultAccessPolicy,
    });

    this.mssqlDatabasePasswordSecret = new KeyVaultSecret(
      this,
      "mssqlDatabasePasswordSecret",
      {
        keyVaultId: this.mssqlDatabaseVaultCredentials.id,
        name: "mssqlPassword",
        value: mssqlDatabasePassword.result,
      }
    );

    this.mssqlDatabaseLoginSecret = new KeyVaultSecret(
      this,
      "mssqlDatabaseLoginSecret",
      {
        keyVaultId: this.mssqlDatabaseVaultCredentials.id,
        name: "mssqlLogin",
        value: config.administratorLogin,
      }
    );

    this.mssqlServer = new MssqlServer(this, "mssqlServer", {
      name: config.serverName,
      resourceGroupName: this.mssqlDatabaseRG.name,
      location: "canadacentral",
      administratorLogin: config.administratorLogin,
      administratorLoginPassword: mssqlDatabasePassword.result,
      version: "12.0",
    });
  }
}
