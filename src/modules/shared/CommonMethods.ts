import { SelectQueryBuilder } from 'typeorm';

export class CommonMethods {
  /**
   * Adds relations to the query based on provided relations in DTO and context.
   *
   * @param query - TypeORM Query Builder instance.
   * @param relations - Array containing relations.
   * @param alias - Starting query builder alias for given table.
   */
  static handleRelations(
    query: SelectQueryBuilder<any>,
    relations: string[],
    alias = '',
    usedRelations = [],
  ) {
    relations.forEach((relation) => {
      const [head, ...tail] = relation.split('.');
      const currentRelation = alias ? alias + '.' + head : head;

      // Ensure that this relation is only added once to prevent SQL errors
      if (!usedRelations.includes(currentRelation)) {
        query.leftJoinAndSelect(currentRelation, head);
        usedRelations.push(currentRelation);
      }

      // If there are more relations nested under this one, handle them recursively
      if (tail.length > 0) {
        this.handleRelations(
          query,
          [tail.join('.')],
          head, // passing current alias
          usedRelations,
        );
      }
    });
    return query;
  }
}
