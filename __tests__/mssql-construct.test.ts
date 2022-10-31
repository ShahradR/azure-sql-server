import "cdktf/lib/testing/adapters/jest";
import { Testing } from "cdktf";
import { MsSQLConstruct } from "../src/mssql-construct";
import {
  KeyVault,
  KeyVaultSecret,
  MssqlServer,
  ResourceGroup,
} from "@cdktf/provider-azurerm";

/**
 * Construct object used throughout this test.
 */
const construct: string = Testing.synthScope((scope) => {
  new MsSQLConstruct(scope, "test", {
    resourceGroupName: "testResourceGroup",
    serverName: "testServer",
    administratorLogin: "username",
    keyVaultName: "testKeyVault",
    keyVaultAccessPolicy: [
      {
        objectId: "testObjectId",
        tenantId: "testTenantId",
        secretPermissions: ["Get", "List", "Set", "Delete", "Purge"],
      },
    ],
    tenantId: "testTenantId",
  });
});

/**
 * Test that the ResourceGroup object is created.
 */
describe("given a synthesized Terraform configuration", () => {
  describe("when the Azure provider is used", () => {
    describe("a resource group for the database", () => {
      it("should be defined", () => {
        expect.assertions(1);

        expect(construct).toHaveResource(ResourceGroup);
      });

      it("should have the correct name", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(ResourceGroup, {
          name: "testResourceGroup",
        });
      });

      /**
       * Verify that the resource group is in the correct location. Note that
       * the Canada East region does not support SQL Server deployments, so we
       * deploy to Canada Central instead.
       */
      it("should be deployed in the Canada Central region", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(ResourceGroup, {
          location: "canadacentral",
        });
      });
    });

    /**
     *
     */
    describe("a Microsoft SQL Server Database Server", () => {
      it("should be defined", () => {
        expect.assertions(1);

        expect(construct).toHaveResource(MssqlServer);
      });

      it("should have the correct name", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(MssqlServer, {
          name: "testServer",
        });
      });

      it("should be deployed in the Canada Central region", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(MssqlServer, {
          location: "canadacentral",
        });
      });

      it("should have the correct administrator login", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(MssqlServer, {
          administrator_login: "username",
        });
      });

      it("should have the correct administrator password", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(MssqlServer, {
          administrator_login_password:
            "${random_password.test_mssqlDatabasePassword_2F7BA3B8.result}", // eslint-disable-line no-template-curly-in-string
        });
      });

      it("should have the correct version", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(MssqlServer, {
          version: "12.0",
        });
      });

      it("should be deployed in the correct resource group", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(MssqlServer, {
          resource_group_name:
            "${azurerm_resource_group.test_mssqlDatabaseRG_DFCCA7A8.name}", // eslint-disable-line no-template-curly-in-string
        });
      });
    });

    describe("an Azure Key Vault", () => {
      it("should be defined", () => {
        expect.assertions(1);

        expect(construct).toHaveResource(KeyVault);
      });

      it("should have the correct name", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(KeyVault, {
          name: "testKeyVault",
        });
      });

      it("should be deployed in the Canada Central region", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(KeyVault, {
          location: "canadacentral",
        });
      });

      it("should be deployed in the correct resource group", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(KeyVault, {
          resource_group_name:
            "${azurerm_resource_group.test_mssqlDatabaseRG_DFCCA7A8.name}", // eslint-disable-line no-template-curly-in-string
        });
      });

      it("should read the tenant ID from the client configuration", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(KeyVault, {
          tenant_id: "testTenantId",
        });
      });

      it("should have the correct access policies", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(KeyVault, {
          access_policy: [
            {
              tenant_id: "testTenantId",
              object_id: "testObjectId",
              secret_permissions: ["Get", "List", "Set", "Delete", "Purge"],
              application_id: null,
              certificate_permissions: null,
              key_permissions: null,
              storage_permissions: null,
            },
          ],
        });
      });

      it("should only allow Azure Services access to the secret", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(KeyVault, {
          network_acls: {
            default_action: "Deny",
            bypass: "AzureServices",
          },
        });
      });
    });

    describe("a Key Vault Secret for the SQL Server database login", () => {
      it("should be defined", () => {
        expect.assertions(1);

        expect(construct).toHaveResource(KeyVaultSecret);
      });

      it("should have the correct name", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(KeyVaultSecret, {
          name: "mssqlLogin",
        });
      });

      it("should have the correct value", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(KeyVaultSecret, {
          value: "username",
        });
      });

      it("should be deployed in the correct Key Vault", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(KeyVaultSecret, {
          key_vault_id: "${azurerm_key_vault.test_mssqlKeyVault_FF0CC014.id}", // eslint-disable-line no-template-curly-in-string
        });
      });
    });

    describe("a Key Vault Secret for the SQL Server database password", () => {
      it("should be defined", () => {
        expect.assertions(1);

        expect(construct).toHaveResource(KeyVaultSecret);
      });

      it("should have the correct name", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(KeyVaultSecret, {
          name: "mssqlPassword",
        });
      });

      it("should have the correct value", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(KeyVaultSecret, {
          value:
            "${random_password.test_mssqlDatabasePassword_2F7BA3B8.result}", // eslint-disable-line no-template-curly-in-string
        });
      });

      it("should be deployed in the correct Key Vault", () => {
        expect.assertions(1);

        expect(construct).toHaveResourceWithProperties(KeyVaultSecret, {
          key_vault_id: "${azurerm_key_vault.test_mssqlKeyVault_FF0CC014.id}", // eslint-disable-line no-template-curly-in-string
        });
      });
    });
  });
});
