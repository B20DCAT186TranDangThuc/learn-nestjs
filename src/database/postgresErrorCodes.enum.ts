
export enum PostgresErrorCodes {
  UniqueViolation = '23505',
  ForeignKeyViolation = '23503',
  CheckViolation = '23514',
  NotNullViolation = '23502',
  DataException = '22000',
  SyntaxError = '42601',
  UndefinedTable = '42P01',
  UndefinedColumn = '42703',
  InsufficientPrivilege = '42501',
  TransactionRollback = '40P01',
}
