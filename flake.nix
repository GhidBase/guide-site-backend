{
  description = "Development environment for guide-site-backend";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      utils,
    }:
    utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShell =
          with pkgs;
          mkShell {
            packages = [
              nodejs_24
              prisma
              prisma-engines
            ];

            shellHook = ''
              export PKG_CONFIG_PATH="${pkgs.openssl.dev}/lib/pkgconfig"
              export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines}/bin/schema-engine"
              export PRISMA_QUERY_ENGINE_BINARY="${pkgs.prisma-engines}/bin/query-engine"
              export PRISMA_QUERY_ENGINE_LIBRARY="${pkgs.prisma-engines}/lib/libquery_engine.node"
              export PRISMA_FMT_BINARY="${pkgs.prisma-engines}/bin/prisma-fmt"
            '';

          };
      }
    );
}
