import type { NamingStrategyInterface, Table } from 'typeorm';
import { DefaultNamingStrategy } from 'typeorm';
import { snakeCase } from 'typeorm/util/StringUtils';

export class SnakeNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(className: string, customName: string): string {
    return customName ? customName : snakeCase(className);
  }

  columnName(
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[],
  ): string {
    return (
      snakeCase(embeddedPrefixes.join('_')) +
      (customName ? customName : snakeCase(propertyName))
    );
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return snakeCase(relationName + '_' + referencedColumnName);
  }

  joinTableName(firstTableName: string, secondTableName: string): string {
    return snakeCase(firstTableName + '_' + secondTableName);
  }

  joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string,
  ): string {
    return snakeCase(
      tableName + '_' + (columnName ? columnName : propertyName),
    );
  }

  indexName(tableOrName: string | Table, columnNames: string[]): string {
    const tableName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    return 'idx-' + tableName + '-' + columnNames.join('-');
  }

  foreignKeyName(tableOrName: string | Table, columnNames: string[]): string {
    const tableName =
      typeof tableOrName === 'string' ? tableOrName : tableOrName.name;
    return 'fk-' + tableName + '-' + columnNames.join('-');
  }
}
