// @flow
export const EXPR_FROM_SQL = 'EXPR_FROM_SQL';

type Action =
  | {type: 'EXPR_FROM_SQL', sql: {[string]: any}};

export function exprFromSql(sql: {[string]: any}): Action {
  return {type: EXPR_FROM_SQL, sql};
}

type State = {
  expr: {[string]: any}
};

const initialState = {
  expr: {}
}

const opMap = {
  '=': '$eq',
  '!=': '$ne',
  '>': '$gt',
  '>=': '$gte',
  '<': '$lt',
  '<=': '$lte'
};

function convertExpr(expr: {[string]: any}) {
  switch(expr.type) {
    case 'AndExpression':
      let and: Array<any> = [];

      const left = convertExpr(expr.left);
      if (Array.isArray(left)) {
        and = and.concat(left);
      } else {
        and.push(left);
      }

      const right = convertExpr(expr.right);
      if (Array.isArray(right)) {
        and = and.concat(right);
      } else {
        and.push(right);
      }
      return and;
    case 'ComparisonBooleanPrimary':
      let ret = {};
      ret[(convertExpr(expr.left): any)] = {[opMap[expr.operator]]: convertExpr(expr.right)};
      return [ret];
    case 'Identifier':
    case 'Number':
    case 'String':
      return expr.value;
    default:
      throw new Error('Invalid expression.');
  }
}

function buildExpr(sql) {
  switch (sql.type) {
    case 'Select':
      let from = sql.from.value.map((v) => buildExpr(v));
      if (from.length > 1) {
        throw new Error('Only single table queries currently supported.');
      }

      if (sql.where) {
        from = [{selection: {
          arguments: {select: convertExpr(sql.where)},
          children: from
        }}];
      }

      const select = sql.selectItems.value;
      if (select.length === 1 && select[0].value === '*') {
        return from[0];
      } else {
        const project = select.map((field) => field.value);
        const projection = {projection: {
          arguments: {project},
          children: from
        }};

        const rename = select.filter((field) => field.hasAs).map((field) => [field.value, field.alias]);
        if (rename.length > 0) {
          return {rename: {
            arguments: {rename: (Object:any).fromEntries(rename)},
            children: [projection]
          }};
        } else {
          return projection;
        }
      }
    case 'TableRefrence':
      return buildExpr(sql.value);
    case 'TableFactor':
      return {relation: sql.value.value};
    default:
      throw new Error('Unsupported statement.');
  }
}

export default (state: State = initialState, action: Action) => {
  switch(action.type) {
    case EXPR_FROM_SQL:
      return {
        ...state,
        expr: buildExpr(action.sql)
      };
    default:
      return {
        ...state
      }
  }
}
