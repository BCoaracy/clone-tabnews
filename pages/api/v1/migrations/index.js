import migrationRunner from 'node-pg-migrate';
import { join } from 'node:path';
import database from 'infra/database.js';

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();
  const defaultMigrationOptions = {
      dbClient: dbClient,
      dryRun: true,
      dir: join("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    }

  const bdCredentials = [process.env.POSTGRES_HOST, 
    process.env.POSTGRES_PORT, 
    process.env.POSTGRES_USER, 
    process.env.POSTGRES_DB,
    process.env.POSTGRES_PASSWORD,
    process.env.DATABASE_URL];
  console.log(`Credencial: ${bdCredentials}`)

  if (request.method === 'GET') {
    const pendentingMigrations = await migrationRunner(defaultMigrationOptions);
    await dbClient.end();
    return response.status(200).json(pendentingMigrations);
  }
  if (request.method === 'POST') {
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
    })

    await dbClient.end();
    
    if (migratedMigrations.length > 0){
      return response.status(201).json(migratedMigrations);
    }
    return response.status(200).json(migratedMigrations);
  }
  
  return response.status(405).end();
  
};
  