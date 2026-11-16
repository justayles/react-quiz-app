import type { Question } from '../types';

export const sqlQuestions = [
  {
    id: 'sql-001',
    tech: 'sql',
    topic: 'joins',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'Ada has an order. Bo does not. Which names does this inner join return?',
    code: {
      lang: 'ts',
      source: "INSERT INTO customers (id, name) VALUES (1, 'Ada'), (2, 'Bo');\nINSERT INTO orders (id, customer_id) VALUES (10, 1);\n\nSELECT c.name\nFROM customers AS c\nINNER JOIN orders AS o ON o.customer_id = c.id;",
    },
    options: [
      'Only Ada. An inner join keeps a row only when both sides match, and Bo has no order.',
      'Ada and Bo. An inner join keeps every customer and fills a missing order with NULL.',
      'No rows. An inner join requires the two tables to have the same number of rows.',
      'Only Bo. An inner join returns the side that failed to match.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Only Ada is returned. Bo has no matching order, so the inner join drops Bo.',
      why: 'A join matches rows from two tables. An inner join keeps a result row only when the ON test is true for a pair. Ada pairs with order 10. Bo has no order whose customer_id is 2, so there is no pair to keep. NULL would mean a missing value on an unmatched side, but an inner join does not invent that row. It simply leaves Bo out.',
      wrong: [
        {
          option: 'Ada and Bo. An inner join keeps every customer and fills a missing order with NULL.',
          reason: 'Keeping every left-table row and filling the other side with NULL is what a left join does. An inner join has no unmatched row to fill.',
        },
        {
          option: 'No rows. An inner join requires the two tables to have the same number of rows.',
          reason: 'The tables do not need the same row count. Each order is matched to a customer independently, so the one matching pair is enough to return Ada.',
        },
        {
          option: 'Only Bo. An inner join returns the side that failed to match.',
          reason: 'The unmatched customer is the row an inner join removes. Bo failed to match, so Bo is the name that disappears, not the name that remains.',
        },
      ],
      example: {
        lang: 'ts',
        source: "CREATE TABLE customers (\n  id int PRIMARY KEY,\n  name varchar(100) NOT NULL\n);\nCREATE TABLE orders (\n  id int PRIMARY KEY,\n  customer_id int NOT NULL\n);\nINSERT INTO customers (id, name) VALUES (1, 'Ada'), (2, 'Bo');\nINSERT INTO orders (id, customer_id) VALUES (10, 1);\nSELECT c.name\nFROM customers AS c\nINNER JOIN orders AS o ON o.customer_id = c.id;",
      },
      remember: 'An inner join keeps only matching rows. Unmatched rows from either side are dropped.',
    },
  },
  {
    id: 'sql-002',
    tech: 'sql',
    topic: 'joins',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'The report should list every customer, and the order id only when that customer has a paid order. Bo has no orders and disappears. What is wrong?',
    code: {
      lang: 'ts',
      source: "INSERT INTO customers (id, name) VALUES (1, 'Ada'), (2, 'Bo');\nINSERT INTO orders (id, customer_id, status) VALUES (10, 1, 'paid');\n\nSELECT c.name, o.id\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.id\nWHERE o.status = 'paid';",
    },
    options: [
      'The bug is the left join keyword. A right join would keep Bo and still require a paid order.',
      'The WHERE test on o.status runs after the join and rejects the NULL-extended row for Bo, so Bo disappears. Put status = paid in the ON clause to keep every customer.',
      'A left join never fills the right side with NULL, so the WHERE is fine and Bo still appears with a NULL id.',
      'The query fails to parse. A WHERE clause is not allowed after a left join.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The WHERE clause on the orders column turns this left join back into an inner join, so Bo is removed.',
      why: 'A left join keeps every left-table row. When the right table has no match, the right-side columns are NULL. NULL means the value is missing. WHERE then keeps a row only when its test is true. For Bo, o.status is NULL, and NULL = paid is unknown, not true, so WHERE throws that row away. A filter on a left-table column, such as the customer name, would not do this. A filter on a right-table column does. Move the paid test into ON so it limits which orders match, while customers with no paid order stay.',
      wrong: [
        {
          option: 'The bug is the left join keyword. A right join would keep Bo and still require a paid order.',
          reason: 'A right join would keep every order and might drop customers. The left table is already the customer table, which is the side this report must preserve. The damage comes from WHERE, not from the left join keyword.',
        },
        {
          option: 'A left join never fills the right side with NULL, so the WHERE is fine and Bo still appears with a NULL id.',
          reason: 'A left join does fill an unmatched right side with NULL. That NULL status then fails the WHERE test, which is why Bo is missing from the result.',
        },
        {
          option: 'The query fails to parse. A WHERE clause is not allowed after a left join.',
          reason: 'WHERE after a join is normal syntax. The statement runs. It runs with inner-join behavior because the extra test rejects the unmatched customer.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "SELECT c.name, o.id\nFROM customers AS c\nLEFT JOIN orders AS o\n  ON o.customer_id = c.id\n  AND o.status = 'paid';",
      },
      example: {
        lang: 'ts',
        source: "SELECT c.name, o.id\nFROM customers AS c\nLEFT JOIN orders AS o\n  ON o.customer_id = c.id\n  AND o.status = 'paid';\n\n-- Ada matches the paid order.\n-- Bo stays, with NULL order columns.\n-- A right-table test belongs in ON.",
      },
      remember: 'A WHERE test on the right table after a left join drops the unmatched left rows. Put that test in ON.',
    },
  },
  {
    id: 'sql-003',
    tech: 'sql',
    topic: 'joins',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'A left join finds no order for one customer. What happens to that customer row?',
    options: [
      'The customer row is dropped. A left join keeps only matches, the same as an inner join.',
      'The customer row is kept and every order column is filled with a default such as 0 or an empty string.',
      'The customer row is kept and the order columns are NULL.',
      'The query fails. A left row without a match is an error.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'The customer is kept, and the columns that would have come from the order are NULL.',
      why: 'A left join starts from every row of the left table and looks for matches on the right. NULL means a missing value. When no order matches, the engine still emits the customer and sets each order column to NULL. That is different from an inner join, which would drop the customer, and different from a default such as 0, which would be a real value and could be confused with a real order id. The query is valid. An unmatched left row is not an error.',
      wrong: [
        {
          option: 'The customer row is dropped. A left join keeps only matches, the same as an inner join.',
          reason: 'Dropping the unmatched side is inner-join behavior. The left in left join names the table whose rows are preserved.',
        },
        {
          option: 'The customer row is kept and every order column is filled with a default such as 0 or an empty string.',
          reason: 'A missing match is not replaced with 0 or an empty string. Those are ordinary values. The right side is NULL so later tests can tell that no order was found.',
        },
        {
          option: 'The query fails. A left row without a match is an error.',
          reason: 'Unmatched left rows are a normal result, not a runtime error. The statement completes and includes those rows.',
        },
      ],
      example: {
        lang: 'ts',
        source: "SELECT c.name, o.id\nFROM customers AS c\nLEFT JOIN orders AS o\n  ON o.customer_id = c.id;\n\n-- Every customer is returned.\n-- A customer with no order has NULL in o.id.\n-- The left table is the preserved side.",
      },
      remember: 'A left join keeps every left row. Unmatched right-side columns are NULL.',
    },
  },
  {
    id: 'sql-004',
    tech: 'sql',
    topic: 'joins',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'Ada has a paid order, Bo has no orders, and Cy has only an open order. Which names does this query return?',
    code: {
      lang: 'ts',
      source: "INSERT INTO customers (id, name) VALUES (1, 'Ada'), (2, 'Bo'), (3, 'Cy');\nINSERT INTO orders (id, customer_id, status) VALUES (10, 1, 'paid');\nINSERT INTO orders (id, customer_id, status) VALUES (11, 3, 'open');\n\nSELECT c.name, o.id\nFROM customers AS c\nLEFT JOIN orders AS o\n  ON o.customer_id = c.id\n  AND o.status = 'paid';",
    },
    options: [
      'Only Ada. A condition in ON always removes left rows that fail it.',
      'Ada and Cy. The open order still matches because ON ignores the status test.',
      'No rows. AND inside an ON clause is a syntax error.',
      'Ada, Bo, and Cy. The status test limits which orders match, and customers with no paid order stay, with NULL order columns.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'Ada, Bo, and Cy are all returned. Only Ada has a non-NULL order id.',
      why: 'The status test sits in ON, so it decides which orders match. It does not decide which customers survive. Ada matches the paid order, so the result has Ada and order 10. Bo has no order, so Bo is kept with NULL order columns. Cy has an order, but that order is open, so it fails the ON test and does not match. Cy is still kept, with NULL order columns, because a failed ON condition on a left join does not remove the left row. AND is normal inside ON. The result is three rows.',
      wrong: [
        {
          option: 'Only Ada. A condition in ON always removes left rows that fail it.',
          reason: 'That would be true of a WHERE test on the order status. In ON, a failed right-table test means no match, and the left row remains.',
        },
        {
          option: 'Ada and Cy. The open order still matches because ON ignores the status test.',
          reason: 'ON does not ignore its own conditions. The open order fails status = paid, so it is not a match. Cy remains only as an unmatched customer.',
        },
        {
          option: 'No rows. AND inside an ON clause is a syntax error.',
          reason: 'AND is valid in ON and is how you combine the key test with an extra match rule. The statement runs and returns three customers.',
        },
      ],
      example: {
        lang: 'ts',
        source: "SELECT c.name, o.id\nFROM customers AS c\nLEFT JOIN orders AS o\n  ON o.customer_id = c.id\n  AND o.status = 'paid';\n\n-- Paid orders match.\n-- Customers with no paid order still appear.\n-- Their order columns are NULL.",
      },
      remember: 'In a left join, ON filters the match. It does not remove unmatched left rows.',
    },
  },
  {
    id: 'sql-005',
    tech: 'sql',
    topic: 'joins',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'You need every product, including products that have never been ordered, plus the number of order lines. Which query does that?',
    options: [
      'From products left join order_lines, group by the product id and name, and count order_lines.id. A product that was never ordered stays, with a count of 0.',
      'From products inner join order_lines, group by the product, and count(*). The inner join already keeps products that have no orders.',
      'From products left join order_lines, then WHERE order_lines.id IS NOT NULL, then count(*). That WHERE keeps the unmatched products.',
      'From products left join order_lines, group by the product, and count(*). The unmatched product is counted as 0 because count(*) skips the NULL-extended row.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Left join from products and count the order-line id. Unordered products remain, and their count is 0.',
      why: 'The product table has to be the preserved side, so the join is a left join from products to order lines. An inner join would drop products that have no lines. A WHERE test that the line id IS NOT NULL runs after the join and also drops those NULL-extended rows, which makes the result an inner join again. count(*) counts rows, including the placeholder row whose line columns are NULL, so an unordered product would show 1. count(order_lines.id) skips NULL. The group still exists because the product row is there, and a count of no non-NULL ids is 0. Group by the product id and name so the query is valid on engines that require every selected column to be grouped or aggregated. sum of those NULL ids would be NULL, not 0. count of a column is the aggregate that turns this missing match into 0.',
      wrong: [
        {
          option: 'From products inner join order_lines, group by the product, and count(*). The inner join already keeps products that have no orders.',
          reason: 'An inner join keeps only products that have at least one line. A product that was never ordered has nothing to match, so it is removed before the count.',
        },
        {
          option: 'From products left join order_lines, then WHERE order_lines.id IS NOT NULL, then count(*). That WHERE keeps the unmatched products.',
          reason: 'IS NOT NULL on the right-table id rejects the NULL-extended product row. The left join is undone, and unordered products disappear.',
        },
        {
          option: 'From products left join order_lines, group by the product, and count(*). The unmatched product is counted as 0 because count(*) skips the NULL-extended row.',
          reason: 'count(*) counts rows, not non-NULL values. The unmatched product still produces one joined row, so count(*) reports 1.',
        },
      ],
      example: {
        lang: 'ts',
        source: "SELECT p.id, p.name, COUNT(ol.id) AS line_count\nFROM products AS p\nLEFT JOIN order_lines AS ol\n  ON ol.product_id = p.id\nGROUP BY p.id, p.name;\n\n-- Never-ordered products still appear.\n-- COUNT(ol.id) is 0 for those rows.\n-- COUNT(*) would have counted them as 1.",
      },
      remember: 'Preserve products with a left join, and count a right-table column so unmatched products count as 0.',
    },
  },
  {
    id: 'sql-006',
    tech: 'sql',
    topic: 'joins',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'The report should list every employee and the manager name when there is one. Ada is the top employee and has a NULL manager id. Ada is missing from the result. What is wrong?',
    code: {
      lang: 'ts',
      source: "INSERT INTO employees (id, name, manager_id) VALUES (1, 'Ada', NULL);\nINSERT INTO employees (id, name, manager_id) VALUES (2, 'Bo', 1);\n\nSELECT e.name, m.name AS manager_name\nFROM employees AS e\nINNER JOIN employees AS m ON m.id = e.manager_id;",
    },
    options: [
      'Nothing is wrong. An employee with no manager is not supposed to appear, and the inner join is what keeps Ada.',
      'Ada disappears because manager_id is NULL and an inner join keeps only matches. Use a left join so Ada stays, with a NULL manager name.',
      'The query returns Ada with manager Ada. A NULL manager id matches every employee, including Ada.',
      'The query errors. A table cannot be joined to itself.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The inner self-join drops Ada because a NULL manager id does not match any employee.',
      why: 'A self-join reads the same table twice under two names. Here e is the employee and m is the manager. An inner join keeps a row only when m.id equals e.manager_id. NULL compared with = is unknown, not true, so Ada does not match a manager row. Bo matches Ada and is returned. The statement is valid. Joining a table to itself is a normal way to follow a relationship stored in the same table. A left join keeps every employee from e, and the manager columns are NULL when manager_id is NULL or points at a missing id.',
      wrong: [
        {
          option: 'Nothing is wrong. An employee with no manager is not supposed to appear, and the inner join is what keeps Ada.',
          reason: 'The report asked for every employee. The inner join is what removes Ada. It does not keep the unmatched employee.',
        },
        {
          option: 'The query returns Ada with manager Ada. A NULL manager id matches every employee, including Ada.',
          reason: 'NULL does not equal Ada id, and it does not equal every id. A comparison with NULL is unknown, so the inner join finds no manager row for Ada.',
        },
        {
          option: 'The query errors. A table cannot be joined to itself.',
          reason: 'A self-join is legal. The two copies are separated by the aliases e and m, and the query runs. It runs without Ada.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "SELECT e.name, m.name AS manager_name\nFROM employees AS e\nLEFT JOIN employees AS m ON m.id = e.manager_id;",
      },
      example: {
        lang: 'ts',
        source: "SELECT e.name, m.name AS manager_name\nFROM employees AS e\nLEFT JOIN employees AS m\n  ON m.id = e.manager_id;\n\n-- Bo is returned with manager Ada.\n-- Ada is returned with a NULL manager name.\n-- NULL manager_id does not match an id.",
      },
      remember: 'A self-join to an optional parent needs a left join, or the NULL parent key drops that row.',
    },
  },
  {
    id: 'sql-007',
    tech: 'sql',
    topic: 'joins',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'Ada has two orders. How many rows does this inner join return, and what are the names?',
    code: {
      lang: 'ts',
      source: "INSERT INTO customers (id, name) VALUES (1, 'Ada');\nINSERT INTO orders (id, customer_id) VALUES (10, 1);\nINSERT INTO orders (id, customer_id) VALUES (11, 1);\n\nSELECT c.name\nFROM customers AS c\nINNER JOIN orders AS o ON o.customer_id = c.id;",
    },
    options: [
      'One row, Ada. A join returns each left row once, no matter how many orders match.',
      'No rows. Two orders make the match ambiguous, so the inner join drops Ada.',
      'Two rows, Ada and Ada. Each matching order produces its own result row.',
      'Three rows. An inner join adds a NULL row when the match count is greater than one.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'The result has two rows, and both names are Ada.',
      why: 'A join builds pairs. Ada matches order 10 and also matches order 11, so there are two pairs. The select list contains only the customer name, but that does not collapse the pairs. Without DISTINCT or GROUP BY, both Ada rows are returned. This multiplication is normal for a one-to-many join. It is not an error, and it does not invent an extra NULL row. If the report wanted one row per customer, it would need an aggregate such as count of orders, grouped by the customer.',
      wrong: [
        {
          option: 'One row, Ada. A join returns each left row once, no matter how many orders match.',
          reason: 'That would be true after GROUP BY or DISTINCT. A plain join emits one result row per matching pair, so two orders produce two rows.',
        },
        {
          option: 'No rows. Two orders make the match ambiguous, so the inner join drops Ada.',
          reason: 'More than one match is not ambiguous to a join. Each match is a separate output row. The engine does not drop the customer for having two orders.',
        },
        {
          option: 'Three rows. An inner join adds a NULL row when the match count is greater than one.',
          reason: 'An inner join does not pad the result with a NULL row. There are two matching orders, so there are two result rows.',
        },
      ],
      example: {
        lang: 'ts',
        source: "SELECT c.name, o.id\nFROM customers AS c\nINNER JOIN orders AS o\n  ON o.customer_id = c.id;\n\n-- One customer with two orders\n-- returns two rows.\n-- Group by the customer to collapse them.",
      },
      remember: 'A one-to-many join repeats the left row once for each match.',
    },
  },
  {
    id: 'sql-008',
    tech: 'sql',
    topic: 'joins',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'Offices are in Austin and Denver. Warehouses are in Austin and Miami. Which set of rows does UNION return? Do not assume an order.',
    code: {
      lang: 'ts',
      source: "SELECT city FROM offices\nUNION\nSELECT city FROM warehouses;\n\n-- offices: Austin, Denver\n-- warehouses: Austin, Miami",
    },
    options: [
      'Four rows, with Austin twice. UNION always keeps duplicate rows.',
      'Two rows, only cities stored in both tables. UNION means the intersection.',
      'The statement is rejected because the two select lists come from different tables.',
      'Austin, Denver, and Miami, each once. UNION removes duplicate rows. UNION ALL would keep both Austin rows. Row order is not guaranteed without ORDER BY.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'UNION returns Austin once, Denver once, and Miami once. The display order is not guaranteed.',
      why: 'UNION stacks two query results and then removes duplicate rows. Austin appears on both sides, so it survives once. Denver and Miami appear once each. UNION ALL would keep both Austin rows, four rows in all. The two sides must have the same number of columns and compatible types. They do not have to come from the same table. Intersection, the rows that appear on both sides only, is INTERSECT, not UNION. Without ORDER BY, the engine may return the three cities in any order, so a correct answer names the set rather than a sorted list.',
      wrong: [
        {
          option: 'Four rows, with Austin twice. UNION always keeps duplicate rows.',
          reason: 'Keeping duplicates is UNION ALL. Plain UNION discards duplicate rows after the two sides are combined, so the second Austin is removed.',
        },
        {
          option: 'Two rows, only cities stored in both tables. UNION means the intersection.',
          reason: 'Only Austin is in both tables. UNION also keeps cities that appear on just one side. The operator that keeps only the overlap is INTERSECT.',
        },
        {
          option: 'The statement is rejected because the two select lists come from different tables.',
          reason: 'Different tables are allowed. The rule is the same column count and compatible types. Both sides select one city value, so the statement is valid.',
        },
      ],
      example: {
        lang: 'ts',
        source: "SELECT city FROM offices\nUNION\nSELECT city FROM warehouses;\n\n-- Austin, Denver, Miami, each once.\n-- Duplicates are removed.\n\nSELECT city FROM offices\nUNION ALL\nSELECT city FROM warehouses;\n\n-- Austin is kept twice.",
      },
      remember: 'UNION removes duplicate rows. UNION ALL keeps them. Both sides need the same number of compatible columns.',
    },
  },
  {
    id: 'sql-009',
    tech: 'sql',
    topic: 'nulls',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'One task has a NULL status. The other status is open. Which rows does this WHERE clause return?',
    versionNote: 'SQL Server can make column = NULL match when the deprecated ANSI_NULLS setting is OFF. The default for current connections is ON, where = NULL does not match. PostgreSQL and MySQL have no such switch.',
    code: {
      lang: 'ts',
      source: "INSERT INTO tasks (id, status) VALUES (1, NULL);\nINSERT INTO tasks (id, status) VALUES (2, 'open');\n\nSELECT id\nFROM tasks\nWHERE status = NULL;",
    },
    options: [
      'No rows on PostgreSQL, MySQL, and SQL Server with ANSI_NULLS ON. A comparison with = NULL is unknown, not true, so WHERE does not keep the row whose status is NULL. Use IS NULL. The deprecated SQL Server ANSI_NULLS OFF mode is the exception and can make = NULL match.',
      'The row whose status is NULL. The = operator treats NULL as equal to NULL on every current engine.',
      'Both rows. A NULL comparison is true for NULL and for non-NULL values.',
      'The statement throws on every engine. SQL forbids = NULL and requires the engine to raise an error before reading the table.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Under normal settings the query returns no rows. status = NULL is never true. Use IS NULL.',
      why: 'NULL means missing, and a comparison with it uses three-valued logic: the result can be true, false, or unknown. unknown is not true and not false. WHERE keeps a row only when the test is true, so unknown rows are discarded. status = NULL is unknown even for the row whose status is NULL. IS NULL is the predicate that is true when the value is missing. IS NOT NULL is true when a value is present. The same trap hides rows in WHERE NOT (status = closed) and in WHERE status <> closed, because a NULL status makes those tests unknown too. To keep the missing rows, write status IS NULL OR status <> closed. SQL Server with the old ANSI_NULLS OFF setting can treat = NULL as a match. That setting is deprecated, and PostgreSQL and MySQL never treat = NULL as true.',
      wrong: [
        {
          option: 'The row whose status is NULL. The = operator treats NULL as equal to NULL on every current engine.',
          reason: 'Equality does not treat two unknown values as a match. The row with a NULL status looks like it should match, and it does not, unless an old SQL Server session has turned ANSI_NULLS off.',
        },
        {
          option: 'Both rows. A NULL comparison is true for NULL and for non-NULL values.',
          reason: 'A comparison with NULL is not true for ordinary values either. open = NULL is unknown, so the open task is rejected along with the NULL task.',
        },
        {
          option: 'The statement throws on every engine. SQL forbids = NULL and requires the engine to raise an error before reading the table.',
          reason: '= NULL is legal syntax. It does not raise an error. It also does not keep any row under normal settings, which is why it is a logic bug rather than a parse error.',
        },
      ],
      example: {
        lang: 'ts',
        source: "SELECT id\nFROM tasks\nWHERE status IS NULL;\n\nSELECT id\nFROM tasks\nWHERE status IS NULL\n   OR status <> 'closed';\n\n-- = NULL does not match.\n-- IS NULL is the test for a missing value.\n-- <> closed also rejects NULL status.",
      },
      remember: 'NULL compared with = is unknown. WHERE keeps only true. Test missing values with IS NULL.',
    },
  },
  {
    id: 'sql-010',
    tech: 'sql',
    topic: 'nulls',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'Ada has an order. Bo has none. One order row has a NULL customer id. The query was supposed to return customers with no orders. What does it return, and what is the bug?',
    code: {
      lang: 'ts',
      source: "INSERT INTO customers (id, name) VALUES (1, 'Ada'), (2, 'Bo');\nINSERT INTO orders (id, customer_id) VALUES (10, 1);\nINSERT INTO orders (id, customer_id) VALUES (11, NULL);\n\nSELECT c.name\nFROM customers AS c\nWHERE c.id NOT IN (SELECT o.customer_id FROM orders AS o);",
    },
    options: [
      'Bo. NOT IN ignores NULL inside the subquery and keeps customers who have no order.',
      'No names. If the subquery returns a NULL, NOT IN is never true: matching customers are false and the rest are unknown, so WHERE returns nothing. NOT EXISTS does not have this trap.',
      'Ada and Bo. NOT IN returns the customers that appear in the subquery, including NULL.',
      'Ada. NOT IN keeps the customers that have an order and drops only the NULL order.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The query returns no names. The NULL customer id makes NOT IN fail for every customer.',
      why: 'NOT IN (subquery) asks whether the outer value differs from every value the subquery returns. If any of those values is NULL, three-valued logic gets in the way. Ada equals the real customer id 1, so NOT IN is false. Bo is not equal to 1, but Bo = NULL is unknown, so NOT IN is unknown rather than true. WHERE keeps only true, so both customers disappear and the result is empty. This happens even though Bo really has no order. NOT EXISTS does not compare against a list that can contain NULL. For each customer it asks whether a row exists with that customer id. The order whose customer id is NULL does not satisfy customer_id = Bo, so Bo is reported. Filtering the subquery with customer_id IS NOT NULL also makes NOT IN safe, but NOT EXISTS is the clearer pattern.',
      wrong: [
        {
          option: 'Bo. NOT IN ignores NULL inside the subquery and keeps customers who have no order.',
          reason: 'NOT IN does not ignore a NULL in the list. That NULL is exactly what turns the test unknown for Bo, so Bo is not returned.',
        },
        {
          option: 'Ada and Bo. NOT IN returns the customers that appear in the subquery, including NULL.',
          reason: 'NOT IN is the rejection test, not the membership test. Even without the NULL, Ada would be excluded because Ada is in the order list. The NULL then excludes Bo as well.',
        },
        {
          option: 'Ada. NOT IN keeps the customers that have an order and drops only the NULL order.',
          reason: 'A customer who appears in the subquery is the one NOT IN removes. Ada has an order, so Ada is not a result row. The NULL does not flip the test into a positive match.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "SELECT c.name\nFROM customers AS c\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM orders AS o\n  WHERE o.customer_id = c.id\n);",
      },
      example: {
        lang: 'ts',
        source: "SELECT c.name\nFROM customers AS c\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM orders AS o\n  WHERE o.customer_id = c.id\n);\n\n-- Bo is returned.\n-- A NULL customer_id does not invent a match.\n-- NOT IN would have returned nobody.",
      },
      remember: 'NOT IN is unsafe when the subquery can return NULL. Use NOT EXISTS.',
    },
  },
  {
    id: 'sql-011',
    tech: 'sql',
    topic: 'nulls',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'The score rows are 10, NULL, and 30. What do count(*), count(score), and sum(score) return?',
    code: {
      lang: 'ts',
      source: "INSERT INTO scores (id, score) VALUES (1, 10);\nINSERT INTO scores (id, score) VALUES (2, NULL);\nINSERT INTO scores (id, score) VALUES (3, 30);\n\nSELECT COUNT(*) AS row_count,\n       COUNT(score) AS score_count,\n       SUM(score) AS score_total\nFROM scores;",
    },
    options: [
      '3, 3, and 40. count of a column keeps NULL rows, and sum treats NULL as 0.',
      '2, 2, and NULL. count(*) skips NULL rows, and sum returns NULL if any input is NULL.',
      '3, 2, and 40. count(*) counts every row. count(score) and sum(score) skip the NULL. If every score were NULL, sum(score) would be NULL, not 0.',
      '3, 2, and 0. sum treats the NULL as zero and then ignores the other values.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'The three results are 3, 2, and 40.',
      why: 'An aggregate is a function that combines many rows into one value. count(*) counts rows, so the NULL score still counts and the result is 3. count(score) counts non-NULL scores, so the middle row is skipped and the result is 2. sum(score) also skips NULL and adds 10 and 30, which is 40. Aggregate functions ignore NULL, and count(*) is the exception because it counts rows rather than values. If every score were NULL, or if the table had no rows, sum(score) would return NULL, not 0. Wrap it in coalesce(sum(score), 0) when the report should show 0. coalesce returns the first argument that is not NULL.',
      wrong: [
        {
          option: '3, 3, and 40. count of a column keeps NULL rows, and sum treats NULL as 0.',
          reason: 'count(score) does not keep NULL. It counts values, and the NULL score is not a value, so the middle number is 2 rather than 3. sum also skips NULL instead of adding 0, but 10 + 30 is still 40.',
        },
        {
          option: '2, 2, and NULL. count(*) skips NULL rows, and sum returns NULL if any input is NULL.',
          reason: 'count(*) does not skip rows that contain NULL. One NULL input does not make sum return NULL either. sum skips that input and adds the rest. sum is NULL only when it has no non-NULL inputs.',
        },
        {
          option: '3, 2, and 0. sum treats the NULL as zero and then ignores the other values.',
          reason: 'The 3 and the 2 are right, but sum does not replace the other scores with zero. It ignores the NULL and totals 10 and 30.',
        },
      ],
      example: {
        lang: 'ts',
        source: "SELECT COUNT(*) AS row_count,\n       COUNT(score) AS score_count,\n       COALESCE(SUM(score), 0) AS score_total\nFROM scores;\n\n-- count(*) counts rows.\n-- count(score) skips NULL.\n-- sum skips NULL.\n-- coalesce turns an all-NULL sum into 0.",
      },
      remember: 'count(*) counts rows. count(column) and sum skip NULL. An all-NULL sum is NULL, not 0.',
    },
  },
  {
    id: 'sql-012',
    tech: 'sql',
    topic: 'nulls',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'The author wants departments that have more than one employee. This query does not return those departments. What is wrong, and what is the portable fix?',
    versionNote: 'MySQL accepts a select alias in HAVING, so HAVING headcount > 1 works there. PostgreSQL and SQL Server reject that alias in HAVING. All three reject the alias in WHERE. The portable test repeats the aggregate: HAVING COUNT(*) > 1.',
    code: {
      lang: 'ts',
      source: "SELECT department, COUNT(*) AS headcount\nFROM employees\nWHERE headcount > 1\nGROUP BY department;",
    },
    options: [
      'It returns only departments with more than one employee. WHERE can see select aliases on PostgreSQL, MySQL, and SQL Server.',
      'It groups first, so WHERE headcount > 1 filters groups, the same as HAVING.',
      'It returns every department. An unknown alias in WHERE is ignored.',
      'It fails on PostgreSQL, MySQL, and SQL Server. WHERE runs before grouping and cannot see the select alias or the aggregate. Filter groups with HAVING COUNT(*) > 1. MySQL would accept the alias in HAVING. PostgreSQL and SQL Server would not.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'The query fails. WHERE cannot see headcount. Filter the groups with HAVING COUNT(*) > 1.',
      why: 'WHERE filters rows before grouping. HAVING filters groups after the aggregate is computed. An aggregate is a combined value such as count(*). The select alias headcount does not exist yet when WHERE runs, and count(*) itself is not allowed in WHERE, so PostgreSQL, MySQL, and SQL Server all reject this statement. They do not ignore the unknown name and they do not treat WHERE as HAVING. HAVING COUNT(*) > 1 is valid on all three because HAVING can see aggregates. Repeating the expression is the portable form. MySQL also lets you write HAVING headcount > 1 because it allows a select alias there. PostgreSQL and SQL Server do not, so a query written only for MySQL can fail after it is moved.',
      wrong: [
        {
          option: 'It returns only departments with more than one employee. WHERE can see select aliases on PostgreSQL, MySQL, and SQL Server.',
          reason: 'The alias is chosen because the select list is written above WHERE. The engine still evaluates WHERE first, and none of these engines can see headcount there.',
        },
        {
          option: 'It groups first, so WHERE headcount > 1 filters groups, the same as HAVING.',
          reason: 'Grouping does not happen before WHERE. WHERE cannot filter groups. That job belongs to HAVING, which runs after COUNT(*) exists.',
        },
        {
          option: 'It returns every department. An unknown alias in WHERE is ignored.',
          reason: 'An unknown column in WHERE is an error, not a skipped test. The statement does not return the unfiltered groups.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "SELECT department, COUNT(*) AS headcount\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 1;",
      },
      example: {
        lang: 'ts',
        source: "SELECT department, COUNT(*) AS headcount\nFROM employees\nWHERE active = 1\nGROUP BY department\nHAVING COUNT(*) > 1;\n\n-- WHERE filters rows before grouping.\n-- HAVING filters groups after COUNT.\n-- Do not use the select alias in WHERE.",
      },
      remember: 'WHERE filters rows before grouping. HAVING filters groups. Do not use a select alias in WHERE.',
    },
  },
  {
    id: 'sql-013',
    tech: 'sql',
    topic: 'nulls',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'The change comment says the second INSERT fails because email is UNIQUE, so a missing email can be stored only once. Several users are supposed to omit an email, while any real email may appear only once. What is wrong with that comment?',
    versionNote: 'PostgreSQL and MySQL do not treat two NULLs as equal in a unique column, so both inserts succeed. A SQL Server unique index treats those NULLs as duplicates and allows only one NULL. To allow many missing emails on SQL Server, use a filtered unique index with WHERE email IS NOT NULL. MySQL has no filtered index. PostgreSQL can use a partial index, but a plain UNIQUE already allows the extra NULLs there.',
    code: {
      lang: 'ts',
      source: "CREATE TABLE users (\n  id int PRIMARY KEY,\n  email varchar(200) NULL UNIQUE\n);\n\n-- Comment: the second insert fails.\nINSERT INTO users (id, email) VALUES (1, NULL);\nINSERT INTO users (id, email) VALUES (2, NULL);",
    },
    options: [
      'On PostgreSQL and MySQL both inserts succeed, because a unique constraint does not treat two NULLs as equal. A SQL Server unique index allows only one NULL, so the second insert fails only there. The comment is not true on every engine.',
      'Both inserts fail on PostgreSQL, MySQL, and SQL Server. A unique column never allows more than one NULL.',
      'Both inserts succeed on every engine, including SQL Server. A unique index ignores NULL on all three.',
      'The second insert stores an empty string. UNIQUE converts a second NULL into a blank so the values differ.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The second NULL insert succeeds on PostgreSQL and MySQL and fails on a SQL Server unique index.',
      why: 'A unique constraint rejects two equal non-NULL emails. NULL means missing, and unique checks do not use ordinary equality on every engine. PostgreSQL and MySQL do not consider two NULLs equal, so many users can omit an email while a repeated real address is still rejected. SQL Server unique indexes do consider those NULLs duplicates, so the second missing email is rejected and the comment happens to be true only there. Storing an empty string instead of NULL is worse: the empty string is a real value, so the second blank email collides on every engine. On SQL Server, a filtered unique index indexes only rows where email IS NOT NULL, which allows many NULLs and still rejects duplicate addresses. MySQL cannot add that WHERE clause to an index. PostgreSQL can, but it does not need to for this rule.',
      wrong: [
        {
          option: 'Both inserts fail on PostgreSQL, MySQL, and SQL Server. A unique column never allows more than one NULL.',
          reason: 'That is the comment, and it overgeneralizes the SQL Server rule. PostgreSQL and MySQL accept the second NULL.',
        },
        {
          option: 'Both inserts succeed on every engine, including SQL Server. A unique index ignores NULL on all three.',
          reason: 'PostgreSQL and MySQL do ignore NULL in the uniqueness check. SQL Server does not. Its unique index keeps only one NULL.',
        },
        {
          option: 'The second insert stores an empty string. UNIQUE converts a second NULL into a blank so the values differ.',
          reason: 'UNIQUE does not rewrite NULL into an empty string. The second insert either stores another NULL or fails, depending on the engine.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "CREATE TABLE users (\n  id int PRIMARY KEY,\n  email varchar(200) NULL,\n  UNIQUE (email)\n);\n\nINSERT INTO users (id, email) VALUES (1, NULL);\nINSERT INTO users (id, email) VALUES (2, NULL);\n\n-- SQL Server: skip UNIQUE (email) and use\n-- CREATE UNIQUE INDEX users_email_unique\n--   ON users (email) WHERE email IS NOT NULL;",
      },
      example: {
        lang: 'ts',
        source: "CREATE TABLE users (\n  id int PRIMARY KEY,\n  email varchar(200) NULL,\n  UNIQUE (email)\n);\nINSERT INTO users (id, email) VALUES (1, NULL);\nINSERT INTO users (id, email) VALUES (2, NULL);\n\n-- PostgreSQL and MySQL accept both NULLs.\n-- SQL Server filtered unique index instead:\n-- CREATE UNIQUE INDEX users_email_unique\n--   ON users (email)\n--   WHERE email IS NOT NULL;",
      },
      remember: 'PostgreSQL and MySQL allow many NULLs in a unique column. A SQL Server unique index allows one.',
    },
  },
  {
    id: 'sql-014',
    tech: 'sql',
    topic: 'nulls',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'name is not unique inside a department. What does this grouped query do?',
    versionNote: 'MySQL 5.7.5 added ONLY_FULL_GROUP_BY to the default sql_mode, and MySQL 8 keeps that default. With the mode off, MySQL returns an arbitrary name for the department. PostgreSQL and SQL Server always reject this query. PostgreSQL can omit columns that depend on a grouped primary key, but name does not depend on department here.',
    code: {
      lang: 'ts',
      source: "SELECT department, name, COUNT(*)\nFROM employees\nGROUP BY department;",
    },
    options: [
      'It runs on every engine and returns one arbitrary name per department. The SQL standard has always allowed a selected column to be left out of GROUP BY.',
      'PostgreSQL and SQL Server reject it. MySQL rejects it when ONLY_FULL_GROUP_BY is on, which has been the default since 5.7.5. Older MySQL without that mode returns an arbitrary name for the department.',
      'It runs on every engine because COUNT(*) makes any other selected column legal.',
      'It returns one row per employee. GROUP BY department does not collapse rows when another column is selected.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'PostgreSQL and SQL Server reject the query. Current MySQL rejects it too, unless ONLY_FULL_GROUP_BY is turned off.',
      why: 'GROUP BY collapses rows that share a department into one group, and COUNT(*) reports how many rows were collapsed. In standard SQL, every selected column must be in the GROUP BY list or inside an aggregate. name is neither, and name is not determined by department, because two people in the same department can have different names. PostgreSQL and SQL Server raise an error. MySQL with ONLY_FULL_GROUP_BY, the default since 5.7.5, also raises an error. Older MySQL without that mode picks an arbitrary name from the group, which can change between plans and is not a reliable value. Adding COUNT(*) does not excuse the extra column. The repair is to group by name as well, which changes the meaning, or to stop selecting name, or to use an aggregate such as MIN(name) when one representative value is really intended.',
      wrong: [
        {
          option: 'It runs on every engine and returns one arbitrary name per department. The SQL standard has always allowed a selected column to be left out of GROUP BY.',
          reason: 'The arbitrary name is old MySQL behavior, not the standard, and not PostgreSQL or SQL Server. Those engines reject the statement instead of guessing a name.',
        },
        {
          option: 'It runs on every engine because COUNT(*) makes any other selected column legal.',
          reason: 'The aggregate covers only its own input. name is still a bare column from a row that was collapsed, so the presence of COUNT(*) does not make name legal.',
        },
        {
          option: 'It returns one row per employee. GROUP BY department does not collapse rows when another column is selected.',
          reason: 'GROUP BY still collapses each department into one group when the statement is accepted. Selecting name does not disable grouping. On strict engines the statement is rejected before any rows are returned.',
        },
      ],
      example: {
        lang: 'ts',
        source: "SELECT department, COUNT(*) AS headcount\nFROM employees\nGROUP BY department;\n\nSELECT department, MIN(name) AS sample_name\nFROM employees\nGROUP BY department;\n\n-- A bare name is not determined by department.\n-- Group it, aggregate it, or leave it out.",
      },
      remember: 'In standard SQL, every selected column is grouped or aggregated. Do not rely on old MySQL picking a name for you.',
    },
  },
  {
    id: 'sql-015',
    tech: 'sql',
    topic: 'nulls',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'Ada and Bo both have 100 points. Cy has 90. The window ORDER BY is points descending only. What do RANK, DENSE_RANK, and ROW_NUMBER produce?',
    versionNote: 'MySQL added window functions in 8.0. Older MySQL cannot run this query. PostgreSQL and SQL Server already had them. Where the functions exist, RANK, DENSE_RANK, and ROW_NUMBER follow the same tie rules.',
    code: {
      lang: 'ts',
      source: "INSERT INTO scores (name, points) VALUES ('Ada', 100);\nINSERT INTO scores (name, points) VALUES ('Bo', 100);\nINSERT INTO scores (name, points) VALUES ('Cy', 90);\n\nSELECT name,\n       RANK() OVER (ORDER BY points DESC) AS rank_value,\n       DENSE_RANK() OVER (ORDER BY points DESC) AS dense_value,\n       ROW_NUMBER() OVER (ORDER BY points DESC) AS row_value\nFROM scores;",
    },
    options: [
      'Ada, Bo, and Cy collapse into one row. Window functions group the way GROUP BY does, and the rank columns are 1, 1, and 2.',
      'Everyone receives rank 1, dense rank 1, and row number 1. A tie makes every ranking function return a single shared number.',
      'Ada and Bo both have rank 1 and dense rank 1. Cy has rank 3 and dense rank 2. ROW_NUMBER gives Cy 3, and gives Ada and Bo 1 and 2 in an arbitrary order, because the ORDER BY is not unique.',
      'Ada and Bo have rank 1. Cy has rank 2 for RANK, dense rank, and ROW_NUMBER. RANK does not skip numbers after a tie.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'Ada and Bo are rank 1 and dense rank 1. Cy is rank 3 and dense rank 2. ROW_NUMBER splits the tie arbitrarily.',
      why: 'A window function computes a value for each row and keeps every row. GROUP BY would collapse rows that share a key. RANK, DENSE_RANK, and ROW_NUMBER do not. A tie is two rows that the ORDER BY does not separate. RANK gives both tied rows 1 and then skips to 3 for Cy, because two rows are ahead of Cy. DENSE_RANK does not skip, so Cy is 2. ROW_NUMBER still assigns 1, 2, and 3, but nothing in ORDER BY points DESC says whether Ada or Bo is first. Unless the ORDER BY is unique, that choice is arbitrary and can change. Add a unique column, such as name, when the row number must be stable. MySQL before 8.0 does not have these functions at all.',
      wrong: [
        {
          option: 'Ada, Bo, and Cy collapse into one row. Window functions group the way GROUP BY does, and the rank columns are 1, 1, and 2.',
          reason: 'The useful contrast with GROUP BY is that the three people remain three rows. A window function adds columns. It does not collapse the tied scores into one group.',
        },
        {
          option: 'Everyone receives rank 1, dense rank 1, and row number 1. A tie makes every ranking function return a single shared number.',
          reason: 'A tie shares a rank only among the tied rows. Cy has a lower score, so Cy does not stay at 1, and ROW_NUMBER never assigns the same number twice.',
        },
        {
          option: 'Ada and Bo have rank 1. Cy has rank 2 for RANK, dense rank, and ROW_NUMBER. RANK does not skip numbers after a tie.',
          reason: 'Dense rank is the function that gives Cy 2. RANK leaves a gap, so Cy is 3. ROW_NUMBER is 1, 2, and 3, not a repeated rank.',
        },
      ],
      example: {
        lang: 'ts',
        source: "SELECT name,\n       RANK() OVER (ORDER BY points DESC) AS rank_value,\n       DENSE_RANK() OVER (ORDER BY points DESC) AS dense_value,\n       ROW_NUMBER() OVER (\n         ORDER BY points DESC, name\n       ) AS row_value\nFROM scores;\n\n-- RANK skips after a tie: 1, 1, 3.\n-- DENSE_RANK does not skip: 1, 1, 2.\n-- A unique ORDER BY makes ROW_NUMBER stable.",
      },
      remember: 'RANK skips after a tie. DENSE_RANK does not. ROW_NUMBER breaks ties arbitrarily unless ORDER BY is unique.',
    },
  },
  {
    id: 'sql-016',
    tech: 'sql',
    topic: 'indexes',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'A B-tree index exists on (customer_id, created_at). Which predicates can use it for a normal leftmost seek?',
    versionNote: 'MySQL 8.0.13 and newer can sometimes use an index skip scan for a predicate on created_at alone when customer_id has few distinct values. PostgreSQL and SQL Server do not seek this B-tree for created_at alone. Do not plan on the skip scan.',
    options: [
      'WHERE created_at is greater than or equal to a date, with no test on customer_id. The second column can lead a seek.',
      'WHERE created_at is in a range and status equals open. Any column named in the query can lead the index.',
      'Any predicate that mentions either column, in any order, including created_at alone. Column order is only a storage detail.',
      'A normal B-tree seek can use customer_id alone, or customer_id plus created_at. It cannot use created_at alone. MySQL 8.0.13 or newer may skip-scan created_at alone when customer_id has low cardinality. PostgreSQL and SQL Server will not.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'Seek customer_id, or customer_id and created_at. Do not expect a seek on created_at alone.',
      why: 'A B-tree index is a sorted tree. A composite index on (customer_id, created_at) is sorted by customer_id first and, within each customer, by created_at. A seek can start at the left of that sort order. That is the leftmost-prefix rule. A predicate on customer_id alone can walk the matching customer. A predicate on customer_id plus a created_at range can keep walking inside that customer. A predicate on created_at alone has no place to start, because matching dates are scattered under every customer. PostgreSQL and SQL Server will not use this index for that seek. MySQL 8.0.13 and newer may try an index skip scan when the leading column has few distinct values. That is a special plan, not the rule to design for. Put the equality column first when you create the index.',
      wrong: [
        {
          option: 'WHERE created_at is greater than or equal to a date, with no test on customer_id. The second column can lead a seek.',
          reason: 'The second column cannot lead a normal seek. The tree is ordered by customer_id first, so a date range alone is not a leftmost prefix.',
        },
        {
          option: 'WHERE created_at is in a range and status equals open. Any column named in the query can lead the index.',
          reason: 'status is not even in this index. Naming a column in the query does not let the seek start in the middle of the key.',
        },
        {
          option: 'Any predicate that mentions either column, in any order, including created_at alone. Column order is only a storage detail.',
          reason: 'Column order is the seek order. Mentioning created_at does not make it a leading column. The leftmost prefix is customer_id, not whichever column the query happens to name.',
        },
      ],
      example: {
        lang: 'ts',
        source: "CREATE INDEX orders_customer_created_idx\n  ON orders (customer_id, created_at);\n\nSELECT id\nFROM orders\nWHERE customer_id = 42\n  AND created_at >= '2024-01-01';\n\n-- customer_id alone can seek.\n-- customer_id plus created_at can seek.\n-- created_at alone is not a leftmost prefix.",
      },
      remember: 'A B-tree on (a, b) serves a, or a and b. It does not serve b alone.',
    },
  },
  {
    id: 'sql-017',
    tech: 'sql',
    topic: 'indexes',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'The email lookup wraps the column in LOWER and is still slow. A plain index on email already exists. Why does that index not serve the predicate, and how do you index the lookup?',
    versionNote: 'PostgreSQL can index LOWER(email) directly. MySQL 8.0.13 and newer can index a functional key with extra parentheses: INDEX ((LOWER(email))). SQL Server does not index the call inline. Add a computed column for LOWER(email) and index that column. A case-insensitive collation, or the PostgreSQL citext type, can avoid wrapping the column at all.',
    code: {
      lang: 'ts',
      source: "CREATE INDEX users_email_idx ON users (email);\n\nSELECT id\nFROM users\nWHERE LOWER(email) = 'ada@example.com';",
    },
    options: [
      'LOWER(email) does not match the plain index on email, so the planner cannot seek that index. PostgreSQL indexes LOWER(email) directly. MySQL 8.0.13 or newer indexes ((LOWER(email))) with extra parentheses. SQL Server indexes a computed column instead.',
      'The query is wrong because LOWER changes the stored email permanently in the table before the index is read.',
      'A plain index on email is always used for LOWER(email), because the planner ignores function calls around indexed columns.',
      'The statement fails to parse. WHERE is not allowed to call a function.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The function around email blocks the plain index. Index the same expression the query uses.',
      why: 'A B-tree on email is sorted by the stored email values. LOWER(email) is a different value, so the planner cannot walk that tree to find the lowercase form. The function does not rewrite the stored row. WHERE may call functions. The fix is an expression index whose key is LOWER(email), and the query must use that same expression. PostgreSQL writes CREATE INDEX ON users (LOWER(email)). MySQL 8.0.13 and newer writes CREATE INDEX ON users ((LOWER(email))), with parentheses around the expression. SQL Server indexes a computed column defined as LOWER(email) rather than an inline call. Another approach is to store or compare the email with a case-insensitive collation so the query does not wrap the column. PostgreSQL citext is one such type. A different collation is an engine feature, not a reason the plain index matches LOWER.',
      wrong: [
        {
          option: 'The query is wrong because LOWER changes the stored email permanently in the table before the index is read.',
          reason: 'LOWER in a WHERE clause is a read-side expression. It does not update the column. The slowdown is the missed index, not a rewrite of the table.',
        },
        {
          option: 'A plain index on email is always used for LOWER(email), because the planner ignores function calls around indexed columns.',
          reason: 'The planner does not ignore the function. The index order and the expression result differ, so a seek on the plain email index does not answer LOWER(email).',
        },
        {
          option: 'The statement fails to parse. WHERE is not allowed to call a function.',
          reason: 'LOWER in a predicate is valid SQL. The statement runs. It runs without using the index on the raw email column.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "CREATE INDEX users_email_lower_idx\n  ON users (LOWER(email));\n\nSELECT id\nFROM users\nWHERE LOWER(email) = 'ada@example.com';",
      },
      example: {
        lang: 'ts',
        source: "CREATE INDEX users_email_lower_idx\n  ON users (LOWER(email));\n\nSELECT id\nFROM users\nWHERE LOWER(email) = 'ada@example.com';\n\n-- PostgreSQL indexes the expression.\n-- MySQL 8.0.13+ uses ((LOWER(email))).\n-- SQL Server indexes a computed column.",
      },
      remember: 'A function around a column blocks a plain index. Index that expression, or stop wrapping the column.',
    },
  },
  {
    id: 'sql-018',
    tech: 'sql',
    topic: 'indexes',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'A plain B-tree index exists on sku. Which LIKE pattern can use it for a seek?',
    versionNote: 'PostgreSQL can accelerate LIKE with a leading wildcard by adding the pg_trgm extension and a GIN or GiST trigram index. That is not a plain B-tree, and it is not installed by default. MySQL and SQL Server do not use pg_trgm. Their B-trees also cannot seek a leading wildcard. MySQL FULLTEXT and SQL Server full-text indexes search words, not an arbitrary substring LIKE.',
    code: {
      lang: 'ts',
      source: "SELECT id FROM products WHERE sku LIKE 'ABC%';\nSELECT id FROM products WHERE sku LIKE '%ABC';",
    },
    options: [
      'Both LIKE ABC% and LIKE %ABC can use a plain B-tree index equally. The wildcard position does not matter.',
      'LIKE ABC% can use a B-tree index. LIKE %ABC cannot, unless the engine has another index type such as a PostgreSQL pg_trgm index.',
      'LIKE %ABC can use a B-tree index and LIKE ABC% cannot, because the wildcard has to be on the left for a seek.',
      'Neither pattern can use an index. LIKE always scans the whole table on every engine.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'A trailing wildcard can seek a B-tree. A leading wildcard cannot, unless a different index type exists.',
      why: 'A B-tree on sku is sorted by the start of the value. LIKE ABC% means the value begins with ABC, so the engine can seek to that prefix and stop at the next prefix. LIKE %ABC means ABC can sit anywhere, so every key might qualify and a B-tree seek has no start point. The wildcard position matters. LIKE does not always force a table scan: the left-anchored form can use the index. PostgreSQL can index arbitrary substrings with the pg_trgm extension and a GIN or GiST index, which is a different structure from the plain B-tree. MySQL and SQL Server do not have that extension. Their full-text indexes are built for word search and are not a drop-in replacement for a leading-wildcard LIKE.',
      wrong: [
        {
          option: 'Both LIKE ABC% and LIKE %ABC can use a plain B-tree index equally. The wildcard position does not matter.',
          reason: 'The position is the whole rule. A B-tree is ordered from the left of the value, so a wildcard that hides the left side removes the seek.',
        },
        {
          option: 'LIKE %ABC can use a B-tree index and LIKE ABC% cannot, because the wildcard has to be on the left for a seek.',
          reason: 'This reverses the prefix rule. The known characters have to be on the left. The leading wildcard is the pattern that cannot seek.',
        },
        {
          option: 'Neither pattern can use an index. LIKE always scans the whole table on every engine.',
          reason: 'A left-anchored pattern is a normal B-tree range. Only the leading wildcard forces the plain B-tree to give up the seek.',
        },
      ],
      example: {
        lang: 'ts',
        source: "CREATE INDEX products_sku_idx ON products (sku);\n\nSELECT id\nFROM products\nWHERE sku LIKE 'ABC%';\n\n-- ABC% can seek the B-tree.\n-- %ABC cannot seek that B-tree.\n-- PostgreSQL pg_trgm is a different index.",
      },
      remember: 'LIKE ABC% can use a B-tree. LIKE %ABC cannot, unless you add something like PostgreSQL pg_trgm.',
    },
  },
  {
    id: 'sql-019',
    tech: 'sql',
    topic: 'indexes',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'Almost every order lookup filters customer_id with equality and created_at with a range, then orders by created_at. Which B-tree matches that work?',
    options: [
      'Index (created_at, customer_id). The range column must lead, and the equality column can follow it.',
      'Index (created_at) only. A second column never helps a range, so leave customer_id out.',
      'Index (customer_id, created_at). Equality leads, then the range, so one index serves the filter and can supply created_at order inside that customer.',
      'Index (customer_id) only. A composite index cannot serve a range on the second column, so created_at must not be added.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'Lead with customer_id, then created_at. That is the leftmost order for equality plus a range.',
      why: 'A B-tree seek walks the index from the left. customer_id is an equality, so it picks one slice of the tree. created_at is a range inside that slice, and the same order can avoid a separate sort for ORDER BY created_at. If created_at leads, the range starts a walk across every customer and the later customer_id column is not a seek prefix. A single-column index on customer_id can find the customer but cannot walk the dates in order. A single-column index on created_at serves the range and not the customer equality. Put the equality column first and the range column second.',
      wrong: [
        {
          option: 'Index (created_at, customer_id). The range column must lead, and the equality column can follow it.',
          reason: 'A leading range stops the leftmost prefix. The customer equality would not be used as a further seek. Put the equality first.',
        },
        {
          option: 'Index (created_at) only. A second column never helps a range, so leave customer_id out.',
          reason: 'The second column helps when the first column is an equality. customer_id then created_at uses both the filter and the date order. Dropping customer_id throws away the selective part of the query.',
        },
        {
          option: 'Index (customer_id) only. A composite index cannot serve a range on the second column, so created_at must not be added.',
          reason: 'A range on the second column is a normal use of a composite B-tree, as long as the first column is an equality. Leaving created_at out loses that range and the matching sort.',
        },
      ],
      example: {
        lang: 'ts',
        source: "CREATE INDEX orders_customer_created_idx\n  ON orders (customer_id, created_at);\n\nSELECT id\nFROM orders\nWHERE customer_id = 42\n  AND created_at >= '2024-01-01'\nORDER BY created_at;\n\n-- Equality column first.\n-- Range column second.",
      },
      remember: 'For a B-tree, put equality columns first and the range column after them.',
    },
  },
  {
    id: 'sql-020',
    tech: 'sql',
    topic: 'indexes',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'The hot query filters customer_id only. The index that was added leads with created_at. Why is that a bad seek index for this query?',
    versionNote: 'MySQL 8.0.13 and newer may use an index skip scan when the leading column has few distinct values. PostgreSQL and SQL Server will not seek an index on (created_at, customer_id) for customer_id alone. Design the leading column for the predicate you actually run.',
    code: {
      lang: 'ts',
      source: "CREATE INDEX orders_created_customer_idx\n  ON orders (created_at, customer_id);\n\nSELECT id\nFROM orders\nWHERE customer_id = 42;",
    },
    options: [
      'The index is a perfect match. A composite B-tree can be sought from either end, so customer_id alone uses it.',
      'The query cannot run. A WHERE clause must list every column that appears in the index.',
      'The index is used for this seek because customer_id is selective, and column order does not matter to a B-tree.',
      'The index leads with created_at, so a predicate on customer_id alone does not get a normal B-tree seek. Lead with customer_id. MySQL 8.0.13 or newer may skip-scan in special cases. PostgreSQL and SQL Server will not seek this index for customer_id alone.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'customer_id is not the leftmost column, so a normal B-tree seek cannot start there.',
      why: 'The leftmost-prefix rule says a composite B-tree on (created_at, customer_id) is sorted by created_at first. A seek needs a test on that leading column, or on that column plus customer_id. This query tests only customer_id, which is the second column, so matching rows are not gathered in one place in the tree. The statement is still valid. WHERE does not have to name every indexed column. Selectivity does not reorder the key. PostgreSQL and SQL Server will not use this index for a seek on customer_id. MySQL 8.0.13 and newer can sometimes skip-scan a low-cardinality leading column, and that plan is not something to depend on. Create the index as (customer_id, created_at) or add an index that leads with customer_id.',
      wrong: [
        {
          option: 'The index is a perfect match. A composite B-tree can be sought from either end, so customer_id alone uses it.',
          reason: 'A B-tree seek starts at the left of the key. The right-hand column is not an alternate entry point for a normal seek.',
        },
        {
          option: 'The query cannot run. A WHERE clause must list every column that appears in the index.',
          reason: 'The query is legal and returns the right rows. The bug is which index can serve it, not a missing column in WHERE.',
        },
        {
          option: 'The index is used for this seek because customer_id is selective, and column order does not matter to a B-tree.',
          reason: 'Selectivity can affect whether a usable index is worth using. It does not make a second column into the leftmost prefix. Column order is the seek order.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "CREATE INDEX orders_customer_created_idx\n  ON orders (customer_id, created_at);\n\nSELECT id\nFROM orders\nWHERE customer_id = 42;",
      },
      example: {
        lang: 'ts',
        source: "CREATE INDEX orders_customer_created_idx\n  ON orders (customer_id, created_at);\n\nSELECT id\nFROM orders\nWHERE customer_id = 42;\n\n-- customer_id leads, so this seek works.\n-- (created_at, customer_id) does not\n-- serve customer_id alone.",
      },
      remember: 'A predicate on the second index column alone does not get a normal B-tree seek.',
    },
  },
  {
    id: 'sql-021',
    tech: 'sql',
    topic: 'indexes',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'Someone runs EXPLAIN ANALYZE on a DELETE in production because they only want the plan. What actually happens?',
    versionNote: 'PostgreSQL EXPLAIN does not run the statement. PostgreSQL EXPLAIN ANALYZE does run it, so a DELETE really deletes unless you roll the surrounding transaction back yourself. MySQL 8.0.18 and newer EXPLAIN ANALYZE also runs the statement. Older MySQL has EXPLAIN but not EXPLAIN ANALYZE. SQL Server has no EXPLAIN keyword. An estimated plan does not run the statement. An actual plan does.',
    code: {
      lang: 'ts',
      source: "EXPLAIN ANALYZE DELETE FROM sessions WHERE expired = 1;",
    },
    options: [
      'PostgreSQL EXPLAIN prints a plan and does not run the statement. EXPLAIN ANALYZE runs it, so this DELETE really deletes. MySQL 8.0.18 and newer EXPLAIN ANALYZE also runs the statement. SQL Server has no EXPLAIN keyword: an estimated plan does not run the statement, and an actual plan does.',
      'EXPLAIN and EXPLAIN ANALYZE are both free of side effects on every engine. ANALYZE only adds timing estimates.',
      'EXPLAIN always runs the statement, and EXPLAIN ANALYZE only prints a plan.',
      'EXPLAIN ANALYZE rolls the statement back after measuring it, so the DELETE is undone automatically.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'EXPLAIN ANALYZE runs the DELETE. Plain EXPLAIN on PostgreSQL does not.',
      why: 'A plan is the engine description of how it will read or change rows. PostgreSQL EXPLAIN only builds that description. PostgreSQL EXPLAIN ANALYZE executes the statement to collect real timings, so DELETE FROM sessions removes the expired rows. It does not wrap that work in an automatic rollback. You can begin a transaction yourself and roll it back if you meant to measure without keeping the delete. MySQL EXPLAIN does not execute the statement. MySQL 8.0.18 and newer added EXPLAIN ANALYZE, and that form does execute it. SQL Server does not use the EXPLAIN keyword. Its estimated showplan does not run the statement, and its actual plan does. Do not call ANALYZE a side-effect-free EXPLAIN.',
      wrong: [
        {
          option: 'EXPLAIN and EXPLAIN ANALYZE are both free of side effects on every engine. ANALYZE only adds timing estimates.',
          reason: 'ANALYZE is the form that runs the statement so the timings are real. Treating it as a harmless EXPLAIN is how a production delete gets executed.',
        },
        {
          option: 'EXPLAIN always runs the statement, and EXPLAIN ANALYZE only prints a plan.',
          reason: 'This swaps the two PostgreSQL forms. Plain EXPLAIN is the one that stops at the plan. ANALYZE is the one that executes.',
        },
        {
          option: 'EXPLAIN ANALYZE rolls the statement back after measuring it, so the DELETE is undone automatically.',
          reason: 'Nothing in EXPLAIN ANALYZE starts a transaction and rolls it back for you. The delete is committed or left pending under whatever transaction you already opened.',
        },
      ],
      example: {
        lang: 'ts',
        source: "EXPLAIN DELETE\nFROM sessions\nWHERE expired = 1;\n\n-- PostgreSQL EXPLAIN does not delete.\n-- EXPLAIN ANALYZE would run the delete.\n-- MySQL 8.0.18+ ANALYZE runs it too.\n-- SQL Server estimated plans do not run.\n-- SQL Server actual plans do run.",
      },
      remember: 'PostgreSQL EXPLAIN does not run the statement. EXPLAIN ANALYZE does, and the DELETE is real.',
    },
  },
  {
    id: 'sql-022',
    tech: 'sql',
    topic: 'indexes',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'You want an index that contains only open orders, keyed by customer_id. What can each engine actually create?',
    versionNote: 'PostgreSQL partial indexes use WHERE on CREATE INDEX, and the planner uses one only when the query implies that condition. SQL Server filtered indexes are the similar feature. MySQL CREATE INDEX has no WHERE clause, including in 8.4 and 9.x, so it cannot store only the open rows.',
    options: [
      'A partial index is used for every query on the table, and MySQL, PostgreSQL, and SQL Server all create one with the same WHERE clause.',
      'PostgreSQL can create an index WHERE status = open, and the planner uses it only for queries that imply that condition. SQL Server filtered indexes do the same kind of job. MySQL has no partial-index WHERE clause.',
      'The WHERE on the index is a table CHECK constraint. It rejects rows whose status is not open.',
      'A partial index stores every row and only changes the sort order of status.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'PostgreSQL and SQL Server can index only the open rows. MySQL cannot add a WHERE clause to an index.',
      why: 'A partial index, called a filtered index on SQL Server, stores only the rows that pass an index predicate. The open-order index is therefore smaller and can seek customer_id among open orders. The planner may use it only when the query condition implies status = open. A query that does not restrict status cannot be answered from an index that omitted the other statuses. This is not a CHECK constraint: closed orders are still allowed in the table, they are just absent from that index. It also does not store every row. PostgreSQL writes WHERE status = open on CREATE INDEX. SQL Server writes a filtered index with a similar WHERE. MySQL accepts functional key parts, but CREATE INDEX has no row filter, so the same statement is not valid there.',
      wrong: [
        {
          option: 'A partial index is used for every query on the table, and MySQL, PostgreSQL, and SQL Server all create one with the same WHERE clause.',
          reason: 'MySQL has no WHERE clause on CREATE INDEX. Even on PostgreSQL, the partial index is not a candidate for queries that might need the rows it left out.',
        },
        {
          option: 'The WHERE on the index is a table CHECK constraint. It rejects rows whose status is not open.',
          reason: 'An index predicate limits what the index stores. A CHECK constraint limits what the table stores. Closed orders remain valid rows.',
        },
        {
          option: 'A partial index stores every row and only changes the sort order of status.',
          reason: 'The point of the WHERE clause is to leave non-matching rows out of the index. The key order is a separate choice, here customer_id.',
        },
      ],
      example: {
        lang: 'ts',
        source: "CREATE INDEX orders_open_customer_idx\n  ON orders (customer_id)\n  WHERE status = 'open';\n\nSELECT id\nFROM orders\nWHERE status = 'open'\n  AND customer_id = 42;\n\n-- PostgreSQL partial index.\n-- SQL Server filtered indexes match this idea.\n-- MySQL has no index WHERE clause.",
      },
      remember: 'A partial index stores only rows that pass its WHERE. MySQL cannot create one. The query must imply that filter.',
    },
  },
  {
    id: 'sql-023',
    tech: 'sql',
    topic: 'transactions',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What is the default transaction isolation level on PostgreSQL, MySQL InnoDB, and SQL Server?',
    versionNote: 'PostgreSQL default_transaction_isolation is read committed. MySQL InnoDB transaction_isolation defaults to REPEATABLE-READ. SQL Server defaults to READ COMMITTED. Azure SQL Database often enables READ_COMMITTED_SNAPSHOT, which makes that level use row versions, but the level name is still READ COMMITTED. Traditional SQL Server leaves that database option off until you turn it on. PostgreSQL treats a request for READ UNCOMMITTED as READ COMMITTED.',
    options: [
      'All three default to SERIALIZABLE.',
      'All three default to READ COMMITTED.',
      'PostgreSQL defaults to READ COMMITTED, MySQL InnoDB defaults to REPEATABLE READ, and SQL Server defaults to READ COMMITTED.',
      'PostgreSQL defaults to REPEATABLE READ, MySQL InnoDB defaults to READ UNCOMMITTED, and SQL Server defaults to SERIALIZABLE.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'PostgreSQL and SQL Server default to READ COMMITTED. MySQL InnoDB defaults to REPEATABLE READ.',
      why: 'Isolation level is the promise about which concurrent changes a transaction can see. READ COMMITTED means each statement sees only data that other transactions have committed, and a later statement can see newer commits. REPEATABLE READ is a stronger promise that rows you already read do not change for the rest of your transaction, though engines implement that promise differently. PostgreSQL ships with read committed. MySQL InnoDB ships with REPEATABLE READ. SQL Server ships with READ COMMITTED. They are not the same default, so a bug that appears only under one level can show up after a move between engines. Azure SQL often turns on READ_COMMITTED_SNAPSHOT, which changes how SQL Server implements READ COMMITTED, not the name of the default level. PostgreSQL does not provide dirty reads: asking for READ UNCOMMITTED still behaves as READ COMMITTED.',
      wrong: [
        {
          option: 'All three default to SERIALIZABLE.',
          reason: 'SERIALIZABLE is the strictest standard level and is not the default on any of these three. You have to ask for it.',
        },
        {
          option: 'All three default to READ COMMITTED.',
          reason: 'PostgreSQL and SQL Server do. MySQL InnoDB does not. Its default is REPEATABLE READ, so a test on MySQL is not automatically a test of READ COMMITTED.',
        },
        {
          option: 'PostgreSQL defaults to REPEATABLE READ, MySQL InnoDB defaults to READ UNCOMMITTED, and SQL Server defaults to SERIALIZABLE.',
          reason: 'Each engine is swapped. PostgreSQL is read committed, InnoDB is repeatable read, and SQL Server is read committed. None of them default to read uncommitted or serializable.',
        },
      ],
      example: {
        lang: 'ts',
        source: "-- PostgreSQL default: READ COMMITTED\nSHOW default_transaction_isolation;\n\n-- MySQL InnoDB default: REPEATABLE-READ\nSELECT @@transaction_isolation;\n\n-- SQL Server default: READ COMMITTED\nDBCC USEROPTIONS;\n\n-- Set a level only for the next transaction\n-- when the default is not the one you need.",
      },
      remember: 'PostgreSQL and SQL Server default to READ COMMITTED. MySQL InnoDB defaults to REPEATABLE READ.',
    },
  },
  {
    id: 'sql-024',
    tech: 'sql',
    topic: 'transactions',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Which statement correctly separates a dirty read from a non-repeatable read?',
    versionNote: 'PostgreSQL never returns dirty reads. Requesting READ UNCOMMITTED there still behaves as READ COMMITTED. MySQL InnoDB and SQL Server can dirty-read at READ UNCOMMITTED. REPEATABLE READ prevents a non-repeatable read of the same row on these engines, but the implementations are not the same: snapshots, locks, and phantom behavior differ. Do not treat every REPEATABLE READ as identical.',
    options: [
      'Dirty reads are allowed at every isolation level. READ COMMITTED only blocks them for aggregates.',
      'READ COMMITTED allows dirty reads, and REPEATABLE READ is the first level that blocks them.',
      'A dirty read means the same committed row changed between two selects. REPEATABLE READ allows that and READ COMMITTED does not.',
      'A dirty read is seeing an uncommitted change made by another transaction. READ COMMITTED and stricter levels prevent it. A non-repeatable read is the committed value of the same row changing between two reads in one transaction, and REPEATABLE READ and SERIALIZABLE prevent that.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'Dirty reads are uncommitted changes and stop at READ COMMITTED. Non-repeatable reads are committed changes to the same row and stop at REPEATABLE READ.',
      why: 'A dirty read means transaction B sees a row that transaction A changed and has not committed. If A rolls back, B saw a value that never existed. READ COMMITTED and every stricter level prevent that. READ UNCOMMITTED is the level that allows it on MySQL InnoDB and SQL Server. PostgreSQL does not actually dirty-read: its READ UNCOMMITTED request is treated as READ COMMITTED. A non-repeatable read is different. B reads a committed row, A commits a change to that same row, and B reads it again and sees the new value. That is allowed at READ COMMITTED. REPEATABLE READ and SERIALIZABLE prevent that second look from changing. How they prevent it is not the same on every engine: PostgreSQL uses a snapshot, SQL Server REPEATABLE READ holds locks, and MySQL InnoDB REPEATABLE READ uses its own snapshot rules. Phantom rows and write skew are further anomalies. Do not assume preventing a non-repeatable read means every engine REPEATABLE READ blocks every anomaly.',
      wrong: [
        {
          option: 'Dirty reads are allowed at every isolation level. READ COMMITTED only blocks them for aggregates.',
          reason: 'READ COMMITTED is exactly the level that starts blocking dirty reads, for ordinary row reads as well as aggregates. Higher levels block them too.',
        },
        {
          option: 'READ COMMITTED allows dirty reads, and REPEATABLE READ is the first level that blocks them.',
          reason: 'This moves the dirty-read cutoff up one level. READ COMMITTED already hides uncommitted changes. REPEATABLE READ adds protection against a committed row changing later in your transaction.',
        },
        {
          option: 'A dirty read means the same committed row changed between two selects. REPEATABLE READ allows that and READ COMMITTED does not.',
          reason: 'That definition is a non-repeatable read, and the levels are reversed. READ COMMITTED allows the second read to see the new commit. REPEATABLE READ prevents it.',
        },
      ],
      example: {
        lang: 'ts',
        source: "BEGIN;\nSELECT balance FROM accounts WHERE id = 1;\nCOMMIT;\n\nBEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;\nSELECT balance FROM accounts WHERE id = 1;\nSELECT balance FROM accounts WHERE id = 1;\nCOMMIT;\n\n-- READ COMMITTED can see a new commit.\n-- REPEATABLE READ keeps that row stable.",
      },
      remember: 'Dirty reads are uncommitted and end at READ COMMITTED. Non-repeatable reads are the same row changing, and REPEATABLE READ stops those.',
    },
  },
  {
    id: 'sql-025',
    tech: 'sql',
    topic: 'transactions',
    kind: 'scenario',
    difficulty: 'expert',
    prompt: 'Two doctors are on call. Application code requires at least one to stay on call. Each transaction counts two on-call doctors, then sets its own different row off call. Both use PostgreSQL REPEATABLE READ. What happens?',
    versionNote: 'PostgreSQL REPEATABLE READ uses a snapshot, so neither transaction sees the other committed update, but write skew on two different rows still commits. PostgreSQL SERIALIZABLE detects that conflict and rolls one transaction back with serialization_failure, SQLSTATE 40001. MySQL REPEATABLE READ does not use that check. SQL Server REPEATABLE READ takes locks and can deadlock this pattern instead. The SQL standard assigns phantom protection to SERIALIZABLE. Do not describe every engine REPEATABLE READ as the same thing.',
    options: [
      'Both can commit. Each snapshot still shows the other doctor on call, and the updates touch different rows, so this write skew gets through. PostgreSQL SERIALIZABLE detects it and rolls one transaction back. MySQL and SQL Server REPEATABLE READ are different mechanisms and must not be assumed to do the same thing.',
      'Both commit on every engine REPEATABLE READ, and SERIALIZABLE allows it too because the updated rows differ.',
      'PostgreSQL REPEATABLE READ blocks the second commit because its snapshot prevents every anomaly, including write skew.',
      'The second transaction sees the first update and leaves itself on call, on every engine, because REPEATABLE READ re-reads the latest rows before the update.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'PostgreSQL REPEATABLE READ lets both doctors go off call. SERIALIZABLE on PostgreSQL rejects one of them.',
      why: 'A write skew is two transactions that each read a condition, then write different rows, so the condition becomes false only when both commits are combined. Here each snapshot still shows two doctors on call, and each update changes only its own row. PostgreSQL REPEATABLE READ does not see the other transaction newly committed row, which also means a classic phantom read of a new row does not appear, but it does not detect this write skew. PostgreSQL SERIALIZABLE does detect it and aborts one transaction. The SQL standard prevents phantoms at SERIALIZABLE, not by declaring every REPEATABLE READ identical. MySQL REPEATABLE READ has no serializable snapshot check for this pattern. SQL Server REPEATABLE READ holds shared locks on the rows it read, so the two updates can deadlock instead of quietly committing. Prevent the bug with one atomic statement, a real constraint, or an isolation level that detects the conflict on that engine.',
      wrong: [
        {
          option: 'Both commit on every engine REPEATABLE READ, and SERIALIZABLE allows it too because the updated rows differ.',
          reason: 'Different rows are why PostgreSQL REPEATABLE READ allows the skew. SERIALIZABLE is the PostgreSQL level that rejects it. Other engines do not implement REPEATABLE READ the same way, so both commit everywhere is too broad.',
        },
        {
          option: 'PostgreSQL REPEATABLE READ blocks the second commit because its snapshot prevents every anomaly, including write skew.',
          reason: 'The snapshot hides new commits. It does not by itself reject two writes to different rows. That detection is what PostgreSQL SERIALIZABLE adds.',
        },
        {
          option: 'The second transaction sees the first update and leaves itself on call, on every engine, because REPEATABLE READ re-reads the latest rows before the update.',
          reason: 'A plain count in PostgreSQL REPEATABLE READ keeps the first snapshot. It does not re-read the other doctor after the first transaction commits, so the application still believes someone else is on call.',
        },
      ],
      example: {
        lang: 'ts',
        source: "BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;\n\nSELECT COUNT(*) AS on_call_count\nFROM doctors\nWHERE on_call = 1;\n\nUPDATE doctors\nSET on_call = 0\nWHERE id = 1;\n\nCOMMIT;\n\n-- PostgreSQL SERIALIZABLE can abort one.\n-- REPEATABLE READ can commit both.",
      },
      remember: 'PostgreSQL REPEATABLE READ hides new rows and still allows write skew. SERIALIZABLE is what detects it.',
    },
  },
  {
    id: 'sql-026',
    tech: 'sql',
    topic: 'transactions',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'The second insert hits the primary key. The author still expects COMMIT to save Ada and Cy. What is wrong with that expectation?',
    versionNote: 'PostgreSQL aborts the whole transaction on the error. Later statements fail with SQLSTATE 25P02 until ROLLBACK, or until ROLLBACK TO SAVEPOINT. COMMIT does not keep the earlier insert. MySQL does not abort the transaction for a duplicate-key statement error, so Ada and Cy can still be committed. SQL Server with the default XACT_ABORT OFF behaves like MySQL here. SET XACT_ABORT ON dooms the SQL Server transaction instead.',
    code: {
      lang: 'ts',
      source: "BEGIN;\nINSERT INTO accounts (id, owner) VALUES (1, 'Ada');\nINSERT INTO accounts (id, owner) VALUES (1, 'Bo');\nINSERT INTO accounts (id, owner) VALUES (2, 'Cy');\nCOMMIT;",
    },
    options: [
      'COMMIT saves all three rows. A unique violation is a warning, and every engine continues the transaction.',
      'On PostgreSQL the unique violation aborts the whole transaction. The Cy insert fails until ROLLBACK, and COMMIT keeps neither Ada nor Cy. MySQL, and SQL Server with XACT_ABORT OFF, do not abort the transaction for that statement error, so Ada and Cy can still be committed.',
      'Every engine keeps Ada, rolls back only the duplicate statement, and COMMIT saves Ada and Cy.',
      'The Cy insert deadlocks with the Ada insert, and the engine rolls back a different session.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'PostgreSQL abandons the whole transaction after the duplicate key. MySQL does not.',
      why: 'On PostgreSQL, an error inside a transaction marks that transaction aborted. The insert of Cy never runs as a successful statement: the engine reports that commands are ignored until the end of the transaction block. ROLLBACK is required before the session can do more work. COMMIT does not preserve Ada. A savepoint taken before the risky insert lets you ROLLBACK TO SAVEPOINT and then continue, which is the PostgreSQL way to undo only the failed part. MySQL rolls back the failed statement only. The transaction stays open, so Ada is still pending and Cy can be inserted and committed. SQL Server default XACT_ABORT OFF is like MySQL for this duplicate-key error. XACT_ABORT ON makes SQL Server doom the transaction. Code that catches the error and keeps inserting is safe only on the engines that do not abort. On PostgreSQL it must roll back first.',
      wrong: [
        {
          option: 'COMMIT saves all three rows. A unique violation is a warning, and every engine continues the transaction.',
          reason: 'The duplicate primary key is an error, not a warning that stores Bo anyway. No engine in this question commits all three rows.',
        },
        {
          option: 'Every engine keeps Ada, rolls back only the duplicate statement, and COMMIT saves Ada and Cy.',
          reason: 'That is the MySQL behavior and the SQL Server default, stated as if it were universal. PostgreSQL aborts the transaction, so the later insert and the commit do not save Ada and Cy.',
        },
        {
          option: 'The Cy insert deadlocks with the Ada insert, and the engine rolls back a different session.',
          reason: 'Both inserts are in one session, and the failure is a duplicate key, not a lock cycle with another transaction. Deadlock handling is a different problem.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "BEGIN;\nINSERT INTO accounts (id, owner) VALUES (1, 'Ada');\nSAVEPOINT before_risk;\nROLLBACK TO SAVEPOINT before_risk;\nINSERT INTO accounts (id, owner) VALUES (2, 'Cy');\nCOMMIT;",
      },
      example: {
        lang: 'ts',
        source: "BEGIN;\nINSERT INTO accounts (id, owner) VALUES (1, 'Ada');\nSAVEPOINT before_risk;\nROLLBACK TO SAVEPOINT before_risk;\nINSERT INTO accounts (id, owner) VALUES (2, 'Cy');\nCOMMIT;\n\n-- PostgreSQL: after an error, roll back\n-- or roll back to a savepoint first.\n-- MySQL can continue without that.",
      },
      remember: 'On PostgreSQL, a statement error aborts the transaction until ROLLBACK. MySQL does not abort it the same way.',
    },
  },
  {
    id: 'sql-027',
    tech: 'sql',
    topic: 'transactions',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'Transaction A locks account 1 and then waits for account 2. Transaction B locks account 2 and then waits for account 1. What happens, and what prevents it?',
    versionNote: 'PostgreSQL, MySQL InnoDB, and SQL Server all detect the cycle and roll back one victim. After the PostgreSQL error, that session stays in an aborted transaction until ROLLBACK. InnoDB and SQL Server roll the victim transaction back so the application can start a new one after handling the error.',
    options: [
      'Both wait until a person restarts the database. Engines do not detect lock cycles.',
      'Both commit. Row locks are shared, so opposite lock order is safe.',
      'The engine detects the deadlock and rolls one transaction back. The application should retry the victim. Lock the accounts in the same id order in every transaction so the cycle cannot form.',
      'The engine merges the two transactions into one and commits both in id order.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'This is a deadlock. The engine rolls one transaction back. Lock rows in a consistent order to prevent the cycle.',
      why: 'A deadlock is a cycle of waits: A holds account 1 and needs account 2, while B holds account 2 and needs account 1. Neither can proceed. PostgreSQL, MySQL InnoDB, and SQL Server detect that cycle and choose one victim to roll back, undoing that transaction work. The other transaction can then take the lock and continue. The application should retry the victim. It should not assume both commits succeed. Shared locks would not describe these updates, which need exclusive locks. The engine does not merge the two transactions. The stable prevention is to lock the lower account id first in every transaction, including transfers that move money the other direction. On PostgreSQL the victim session must ROLLBACK before it issues new statements, because the error aborts that transaction.',
      wrong: [
        {
          option: 'Both wait until a person restarts the database. Engines do not detect lock cycles.',
          reason: 'An undetected wait would hang. These engines do detect the cycle and end it by rolling one transaction back.',
        },
        {
          option: 'Both commit. Row locks are shared, so opposite lock order is safe.',
          reason: 'Opposite order is how the cycle forms. The locks needed to update the accounts are not compatible with each other, so both transactions cannot pass through the waits.',
        },
        {
          option: 'The engine merges the two transactions into one and commits both in id order.',
          reason: 'Deadlock handling does not combine two sessions into one successful transaction. One of them loses its work and must be retried by the application.',
        },
      ],
      example: {
        lang: 'ts',
        source: "BEGIN;\nSELECT balance FROM accounts WHERE id = 1 FOR UPDATE;\nSELECT balance FROM accounts WHERE id = 2 FOR UPDATE;\nUPDATE accounts SET balance = balance - 10 WHERE id = 1;\nUPDATE accounts SET balance = balance + 10 WHERE id = 2;\nCOMMIT;\n\n-- Lock the lower id first every time.\n-- SQL Server uses WITH (UPDLOCK).",
      },
      remember: 'Opposite lock order deadlocks. The engine rolls one transaction back. Always lock rows in the same order.',
    },
  },
  {
    id: 'sql-028',
    tech: 'sql',
    topic: 'transactions',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'Two READ COMMITTED transactions both read balance 100. One adds 40 in application memory and writes 140. The other adds 10 and writes 110. The second commit lands last. What is wrong?',
    versionNote: 'The lost update below is READ COMMITTED behavior, the default on PostgreSQL and SQL Server. MySQL InnoDB defaults to REPEATABLE READ, but a plain SELECT followed by an absolute UPDATE can still overwrite a concurrent change there. PostgreSQL REPEATABLE READ instead errors with could not serialize access due to concurrent update when the row changed after the snapshot. SELECT FOR UPDATE is PostgreSQL and MySQL syntax. SQL Server locks the read with WITH (UPDLOCK).',
    code: {
      lang: 'ts',
      source: "BEGIN;\nSELECT balance FROM accounts WHERE id = 1;\n-- Application read 100 and added 40 in memory.\nUPDATE accounts SET balance = 140 WHERE id = 1;\nCOMMIT;",
    },
    options: [
      'The final balance includes both additions. READ COMMITTED merges the two writes into 150.',
      'The second transaction waits forever. READ COMMITTED does not let the later update run after the first commit.',
      'The database rejects the second commit with a serialization error on every engine, including READ COMMITTED.',
      'The later absolute write overwrites the earlier one, so one addition is lost. Under READ COMMITTED this read-modify-write needs a lock or one atomic UPDATE. PostgreSQL REPEATABLE READ would error if the row changed after the snapshot. MySQL REPEATABLE READ can still overwrite.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'The second absolute update overwrites the first, so one addition disappears.',
      why: 'A read-modify-write here means the application reads 100, adds a number in memory, and writes the result as a new absolute balance. Under READ COMMITTED the second transaction waits for the row lock, then writes 110 on top of 140. The plus 40 is gone. The final value is 110, not 150. READ COMMITTED does not merge the increments and does not raise a serialization error for this pattern. One fix is a single UPDATE that adds on the server: SET balance = balance + 40. The engine reads the current locked value while it updates, so both additions survive. The other fix is to lock the row on the read with SELECT FOR UPDATE on PostgreSQL and MySQL, or WITH (UPDLOCK) on SQL Server, and then compute from the locked value. PostgreSQL REPEATABLE READ refuses the second update of a row that changed after its snapshot. MySQL REPEATABLE READ still performs the absolute write after the lock wait, so the lost update remains possible there.',
      wrong: [
        {
          option: 'The final balance includes both additions. READ COMMITTED merges the two writes into 150.',
          reason: 'The statements do not say balance = balance + 40. They store 140 and then 110. READ COMMITTED does not add those two results together.',
        },
        {
          option: 'The second transaction waits forever. READ COMMITTED does not let the later update run after the first commit.',
          reason: 'The second update waits only while the first transaction holds the lock. After that commit, the waiting update runs and replaces the balance.',
        },
        {
          option: 'The database rejects the second commit with a serialization error on every engine, including READ COMMITTED.',
          reason: 'READ COMMITTED does not raise that error for this pattern. PostgreSQL REPEATABLE READ can. MySQL REPEATABLE READ still allows the overwrite, so the error is not universal.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "UPDATE accounts\nSET balance = balance + 40\nWHERE id = 1;",
      },
      example: {
        lang: 'ts',
        source: "UPDATE accounts\nSET balance = balance + 40\nWHERE id = 1;\n\n-- The addition happens on the locked row.\n-- A second session waits, then adds too.\n-- Writing an absolute 140 loses the other add.\n-- Or lock with FOR UPDATE before computing.",
      },
      remember: 'Under READ COMMITTED, a read in the app plus an absolute update can lose a concurrent addition. Add in SQL, or lock the row first.',
    },
  },
  {
    id: 'sql-029',
    tech: 'sql',
    topic: 'transactions',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'Both sessions use READ COMMITTED. Session A reads account 1 and sees 100. Session B sets that balance to 80 and commits. Session A reads the same row again. What does the second read return?',
    versionNote: 'The result 80 depends on READ COMMITTED. MySQL InnoDB defaults to REPEATABLE READ, where this plain second SELECT would still see 100. PostgreSQL and SQL Server default to READ COMMITTED, so they see 80. The script must set READ COMMITTED on MySQL before the test.',
    code: {
      lang: 'ts',
      source: "-- Session A, isolation READ COMMITTED.\nBEGIN;\nSELECT balance FROM accounts WHERE id = 1;\n-- Sees 100.\n-- Session B then runs:\n-- UPDATE accounts SET balance = 80 WHERE id = 1;\n-- COMMIT;\nSELECT balance FROM accounts WHERE id = 1;",
    },
    options: [
      '80. B committed, so READ COMMITTED lets the second read in A see the new value. Seeing 100 again would require REPEATABLE READ or SERIALIZABLE. This is a non-repeatable read, not a dirty read.',
      '100. READ COMMITTED keeps the first snapshot for the whole transaction on every engine.',
      '80 only if A commits before B. Otherwise the second read waits forever.',
      'NULL. A concurrent update clears the row until A commits.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The second read returns 80. That is a non-repeatable read, and READ COMMITTED allows it.',
      why: 'READ COMMITTED takes a fresh look at committed data for each statement. The first statement in A sees 100. B then commits 80, so the change is durable, not an uncommitted dirty value. The second statement in A is allowed to see 80. A dirty read would have been seeing 80 before B committed. A non-repeatable read is this same row changing between two reads inside A. REPEATABLE READ or SERIALIZABLE would keep the second read at 100, but they do it differently on each engine. MySQL InnoDB defaults to REPEATABLE READ, so this quiz result appears there only after the session isolation is set to READ COMMITTED. PostgreSQL and SQL Server already default to that level.',
      wrong: [
        {
          option: '100. READ COMMITTED keeps the first snapshot for the whole transaction on every engine.',
          reason: 'A snapshot held for the whole transaction is the REPEATABLE READ idea, and even that is not implemented the same way everywhere. READ COMMITTED specifically lets the next statement see the new commit.',
        },
        {
          option: '80 only if A commits before B. Otherwise the second read waits forever.',
          reason: 'A did not lock the row with the plain SELECT. B can update and commit. A second read does not wait for A to commit, and it does not require A to commit first.',
        },
        {
          option: 'NULL. A concurrent update clears the row until A commits.',
          reason: 'The update stored 80, not NULL, and it committed. The row is still there. The second read sees the committed balance.',
        },
      ],
      example: {
        lang: 'ts',
        source: "-- Both sessions: READ COMMITTED.\nBEGIN;\nSELECT balance FROM accounts WHERE id = 1;\n\n-- Other session commits balance = 80.\n\nSELECT balance FROM accounts WHERE id = 1;\nCOMMIT;\n\n-- Second read returns 80.\n-- That is a non-repeatable read.",
      },
      remember: 'Under READ COMMITTED, a later statement can see a committed change to a row you already read.',
    },
  },
  {
    id: 'sql-030',
    tech: 'sql',
    topic: 'transactions',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'A transaction inserts a log row, creates a real table named extra, then rolls back. What remains?',
    versionNote: 'MySQL implicitly commits before CREATE TABLE, so the log insert is committed and ROLLBACK does not drop extra. CREATE TEMPORARY TABLE is an exception and does not cause that implicit commit. PostgreSQL rolls back both the insert and this CREATE TABLE. SQL Server rolls back both for this CREATE TABLE. Some other SQL Server operations, such as CREATE DATABASE, cannot run in a transaction.',
    code: {
      lang: 'ts',
      source: "BEGIN;\nINSERT INTO logs (id, message) VALUES (1, 'before');\nCREATE TABLE extra (id int);\nROLLBACK;",
    },
    options: [
      'On PostgreSQL, MySQL, and SQL Server, ROLLBACK removes the log row and drops extra.',
      'MySQL commits the insert when CREATE TABLE runs, so ROLLBACK does not remove that row or the new table. PostgreSQL rolls both back. SQL Server rolls both back for this CREATE TABLE.',
      'CREATE TABLE is ignored inside a transaction on every engine, so only the insert can roll back.',
      'ROLLBACK drops extra on every engine but always keeps the insert.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'MySQL keeps the log row and the new table. PostgreSQL and SQL Server undo both.',
      why: 'Transactional DDL means a schema change can be undone with the data changes around it. PostgreSQL treats this CREATE TABLE as part of the transaction, so ROLLBACK drops extra and removes the log insert. SQL Server also rolls back this CREATE TABLE and the insert. MySQL does not. CREATE TABLE causes an implicit commit first, which commits the log insert, and the new table is created outside the transaction you thought you were in. The later ROLLBACK has nothing left to undo, or it undoes only work started after the implicit commit. CREATE TEMPORARY TABLE on MySQL is different and does not implicit-commit. Do not wrap MySQL schema changes in a transaction and expect a rollback to restore the old schema.',
      wrong: [
        {
          option: 'On PostgreSQL, MySQL, and SQL Server, ROLLBACK removes the log row and drops extra.',
          reason: 'PostgreSQL and SQL Server do that for this CREATE TABLE. MySQL has already committed because of the implicit commit, so the rollback does not put things back.',
        },
        {
          option: 'CREATE TABLE is ignored inside a transaction on every engine, so only the insert can roll back.',
          reason: 'The table is created on all three. The difference is whether that creation and the earlier insert can be rolled back, not whether CREATE TABLE is skipped.',
        },
        {
          option: 'ROLLBACK drops extra on every engine but always keeps the insert.',
          reason: 'No engine in this question keeps the insert while dropping the table. MySQL keeps both. PostgreSQL and SQL Server drop both.',
        },
      ],
      example: {
        lang: 'ts',
        source: "BEGIN;\nINSERT INTO logs (id, message) VALUES (1, 'before');\nCREATE TABLE extra (id int);\nROLLBACK;\n\n-- PostgreSQL: no log row, no extra.\n-- SQL Server: no log row, no extra.\n-- MySQL: the insert is already committed\n-- and extra still exists.",
      },
      remember: 'PostgreSQL can roll back CREATE TABLE. MySQL implicitly commits on CREATE TABLE, so the earlier insert stays.',
    },
  },
  {
    id: 'sql-031',
    tech: 'sql',
    topic: 'modeling',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Which statement is true of a primary key, including how it differs from UNIQUE when NULL is involved?',
    versionNote: 'A primary key rejects NULL and rejects duplicates on PostgreSQL, MySQL, and SQL Server. A UNIQUE constraint is not the same: PostgreSQL and MySQL allow multiple NULLs in a unique column, while a SQL Server unique index allows only one NULL.',
    options: [
      'A primary key allows one NULL and also allows duplicate non-NULL values, the same as UNIQUE on every engine.',
      'A primary key allows duplicate values as long as none of them is NULL.',
      'A primary key rejects NULL and rejects duplicates. UNIQUE is not the same: PostgreSQL and MySQL allow multiple NULLs in a unique column, while a SQL Server unique index allows only one NULL.',
      'A primary key can be NULL when the table has only one row, and it must be NULL when the table is empty.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'A primary key is unique and not null. UNIQUE does not make that same NULL promise on every engine.',
      why: 'A primary key identifies a row. It combines two rules: no duplicate key, and no NULL in the key columns. Inserting NULL into a primary key column fails on PostgreSQL, MySQL, and SQL Server. Inserting a second copy of an existing key fails on all three. A UNIQUE constraint also rejects duplicate non-NULL values, but NULL handling splits. PostgreSQL and MySQL do not treat two NULLs as equal, so a unique column can hold many missing values. A SQL Server unique index allows only one NULL. Calling a unique column a primary key hides that difference and also hides the fact that a primary key forbids NULL entirely. A table has one primary key. It may have more unique constraints.',
      wrong: [
        {
          option: 'A primary key allows one NULL and also allows duplicate non-NULL values, the same as UNIQUE on every engine.',
          reason: 'A primary key allows neither NULL nor duplicates. UNIQUE is a separate constraint, and the engines do not even agree on how many NULLs UNIQUE allows.',
        },
        {
          option: 'A primary key allows duplicate values as long as none of them is NULL.',
          reason: 'Forbidding NULL is only half of the rule. The key must also be unique, so a second copy of a real value is rejected.',
        },
        {
          option: 'A primary key can be NULL when the table has only one row, and it must be NULL when the table is empty.',
          reason: 'Row count does not relax the key. An empty table simply has no key values yet. Any row that is inserted needs a non-NULL unique primary key.',
        },
      ],
      example: {
        lang: 'ts',
        source: "CREATE TABLE customers (\n  id int PRIMARY KEY,\n  email varchar(200) NULL,\n  UNIQUE (email)\n);\n\nINSERT INTO customers (id, email) VALUES (1, NULL);\n\n-- id NULL would fail on every engine.\n-- A second id 1 would fail.\n-- A second NULL email is an engine split.",
      },
      remember: 'A primary key is unique and not null. UNIQUE still allows NULLs, and SQL Server allows only one of them.',
    },
  },
  {
    id: 'sql-032',
    tech: 'sql',
    topic: 'modeling',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'Deleting a customer should leave the orders in place and clear customer_id. This definition uses ON DELETE SET NULL together with NOT NULL. What is wrong?',
    versionNote: 'MySQL rejects the foreign key at creation with error 1830 because SET NULL requires a nullable column. PostgreSQL accepts the definition, then the parent delete fails with a not-null violation. SQL Server also needs the foreign-key column to be nullable for SET NULL to execute. The delete tries to write NULL and fails if the column forbids it.',
    code: {
      lang: 'ts',
      source: "CREATE TABLE customers (\n  id int PRIMARY KEY\n);\n\nCREATE TABLE orders (\n  id int PRIMARY KEY,\n  customer_id int NOT NULL,\n  FOREIGN KEY (customer_id) REFERENCES customers (id)\n    ON DELETE SET NULL\n);",
    },
    options: [
      'The definition is valid on every engine. ON DELETE SET NULL writes zero when the column is NOT NULL.',
      'ON DELETE SET NULL deletes the order row. NOT NULL only affects INSERT.',
      'The foreign key is ignored because the column is NOT NULL, so deleting a customer always succeeds and leaves the orders unchanged.',
      'ON DELETE SET NULL needs a nullable column. MySQL rejects this foreign key at creation. PostgreSQL accepts it, then the parent delete fails when NULL cannot be stored. SQL Server also cannot complete that delete while the column is NOT NULL.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'SET NULL and NOT NULL contradict each other. The column has to allow NULL, or the action has to change.',
      why: 'ON DELETE SET NULL means that when the parent customer disappears, the child customer_id is set to NULL rather than the order being deleted. NULL means a missing parent reference. A NOT NULL column cannot store that missing value. MySQL notices the contradiction while creating the foreign key and rejects it. PostgreSQL creates the key and then fails at DELETE time with a not-null violation, so the customer is not removed. SQL Server likewise needs the foreign-key columns to be nullable for SET NULL to execute, and the delete fails when it tries to write NULL. The action does not substitute zero, does not delete the order, and does not silently ignore the key. If the order must keep a customer, use ON DELETE RESTRICT or NO ACTION and do not use SET NULL. If the order may outlive the customer, drop NOT NULL.',
      wrong: [
        {
          option: 'The definition is valid on every engine. ON DELETE SET NULL writes zero when the column is NOT NULL.',
          reason: 'SET NULL writes NULL, not zero. Zero would be a real customer id. The NOT NULL declaration blocks the NULL write instead of changing what is written.',
        },
        {
          option: 'ON DELETE SET NULL deletes the order row. NOT NULL only affects INSERT.',
          reason: 'Deleting the child row is ON DELETE CASCADE. SET NULL updates the child column. NOT NULL is enforced on that update, not only on INSERT.',
        },
        {
          option: 'The foreign key is ignored because the column is NOT NULL, so deleting a customer always succeeds and leaves the orders unchanged.',
          reason: 'The foreign key is not ignored. MySQL refuses to create it. PostgreSQL and SQL Server fail the parent delete rather than leaving a successful delete with the old customer id.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "CREATE TABLE orders (\n  id int PRIMARY KEY,\n  customer_id int NULL,\n  FOREIGN KEY (customer_id) REFERENCES customers (id)\n    ON DELETE SET NULL\n);",
      },
      example: {
        lang: 'ts',
        source: "CREATE TABLE orders (\n  id int PRIMARY KEY,\n  customer_id int NULL,\n  FOREIGN KEY (customer_id)\n    REFERENCES customers (id)\n    ON DELETE SET NULL\n);\n\nDELETE FROM customers WHERE id = 1;\n\n-- The order remains.\n-- customer_id becomes NULL.\n-- NOT NULL would block that write.",
      },
      remember: 'ON DELETE SET NULL requires a nullable foreign-key column. NOT NULL makes that action impossible.',
    },
  },
  {
    id: 'sql-033',
    tech: 'sql',
    topic: 'modeling',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'A customer has orders. What do ON DELETE CASCADE and ON DELETE RESTRICT do, and where does the syntax differ?',
    versionNote: 'ON DELETE CASCADE deletes dependent rows on PostgreSQL, MySQL, and SQL Server. ON DELETE RESTRICT blocks the parent delete while children exist on PostgreSQL and MySQL. In PostgreSQL, RESTRICT is checked immediately and cannot be deferred, while NO ACTION can be deferred. MySQL InnoDB treats RESTRICT and NO ACTION as the same. SQL Server has ON DELETE NO ACTION, not a RESTRICT keyword, and NO ACTION blocks the parent delete when children exist.',
    options: [
      'ON DELETE CASCADE deletes the dependent orders. ON DELETE RESTRICT blocks the customer delete while those orders exist. In PostgreSQL, RESTRICT is immediate and NO ACTION can be deferred. MySQL InnoDB treats RESTRICT and NO ACTION as the same. SQL Server uses ON DELETE NO ACTION for the block and has no RESTRICT keyword.',
      'ON DELETE CASCADE sets the order customer_id to NULL. ON DELETE RESTRICT deletes the orders.',
      'Both actions delete the customer and keep the orders. The foreign key is checked only by a nightly job.',
      'ON DELETE CASCADE blocks the delete, and ON DELETE RESTRICT removes the customer but leaves orphan orders.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'CASCADE deletes the child orders. RESTRICT blocks the parent delete while children exist. SQL Server spells that block as NO ACTION.',
      why: 'A foreign key says each child customer_id must match a parent customer, or be NULL when the column allows it. ON DELETE chooses what happens when the parent row goes away. CASCADE deletes the dependent orders in the same action, so no orphan order remains. RESTRICT refuses the customer delete while any order still points at that customer. You delete or reassign the orders first. PostgreSQL also has NO ACTION, which is the default. RESTRICT is checked immediately and cannot be deferred. NO ACTION can be deferred to the end of the transaction. MySQL InnoDB treats RESTRICT and NO ACTION as the same immediate rejection. SQL Server does not have a RESTRICT keyword. Its ON DELETE NO ACTION blocks the parent delete when children exist, which is the behavior people mean by restrict. None of these actions leave orphan rows behind on a successful delete, and none of them wait for a nightly job.',
      wrong: [
        {
          option: 'ON DELETE CASCADE sets the order customer_id to NULL. ON DELETE RESTRICT deletes the orders.',
          reason: 'Setting the child column to NULL is ON DELETE SET NULL. CASCADE deletes the child rows. RESTRICT keeps both the customer and the orders by rejecting the delete.',
        },
        {
          option: 'Both actions delete the customer and keep the orders. The foreign key is checked only by a nightly job.',
          reason: 'The check happens as part of the delete. CASCADE does not keep the orders. RESTRICT does not delete the customer while orders exist.',
        },
        {
          option: 'ON DELETE CASCADE blocks the delete, and ON DELETE RESTRICT removes the customer but leaves orphan orders.',
          reason: 'This swaps the two actions and then adds orphans, which a foreign-key delete is there to prevent. CASCADE removes children. RESTRICT blocks the parent delete.',
        },
      ],
      example: {
        lang: 'ts',
        source: "CREATE TABLE orders (\n  id int PRIMARY KEY,\n  customer_id int NOT NULL,\n  FOREIGN KEY (customer_id)\n    REFERENCES customers (id)\n    ON DELETE CASCADE\n);\n\n-- CASCADE deletes the orders with the customer.\n-- RESTRICT or NO ACTION blocks that customer delete.\n-- SQL Server has NO ACTION, not RESTRICT.",
      },
      remember: 'ON DELETE CASCADE deletes dependents. ON DELETE RESTRICT blocks the parent delete while children exist.',
    },
  },
  {
    id: 'sql-034',
    tech: 'sql',
    topic: 'modeling',
    kind: 'scenario',
    difficulty: 'expert',
    prompt: 'products.price has CHECK (price > 0). A developer inserts price -1 on old MySQL and the row is stored. What should they believe?',
    versionNote: 'PostgreSQL has enforced CHECK constraints for a long time. MySQL parsed CHECK and ignored it before 8.0.16, so the negative price was stored. MySQL 8.0.16 and newer enforces CHECK. SQL Server enforces CHECK unless the constraint was created or altered WITH NOCHECK.',
    code: {
      lang: 'ts',
      source: "CREATE TABLE products (\n  id int PRIMARY KEY,\n  price int NOT NULL,\n  CHECK (price > 0)\n);\n\nINSERT INTO products (id, price) VALUES (1, -1);",
    },
    options: [
      'CHECK is documentation on every engine and never rejects a row.',
      'PostgreSQL enforces CHECK, and MySQL enforces it starting in 8.0.16. MySQL before 8.0.16 accepted the clause and ignored it, so the negative price was stored. SQL Server enforces CHECK.',
      'MySQL has always enforced CHECK, and PostgreSQL ignores it unless you add a trigger.',
      'A negative price passes a greater-than check because the sign is stored in a separate column.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The negative price is rejected where CHECK is enforced. Old MySQL did not enforce it.',
      why: 'A CHECK constraint rejects a row when its expression is not true. price > 0 is false for -1, so the insert fails on an engine that enforces the constraint. PostgreSQL does enforce it. SQL Server does too, unless someone created the constraint WITH NOCHECK, which skips checking existing or, when NOCHECK is left in force, newly changed rows. MySQL before 8.0.16 accepted CHECK syntax and did not enforce it, which is why the bad price was stored. From 8.0.16 onward MySQL rejects that insert. A successful insert on old MySQL is not evidence that PostgreSQL or current MySQL will accept the same row. The sign is part of the integer value. It is not a second column that escapes the comparison.',
      wrong: [
        {
          option: 'CHECK is documentation on every engine and never rejects a row.',
          reason: 'That describes old MySQL, not CHECK in general. PostgreSQL, SQL Server, and MySQL 8.0.16 and newer reject a row that fails the expression.',
        },
        {
          option: 'MySQL has always enforced CHECK, and PostgreSQL ignores it unless you add a trigger.',
          reason: 'This reverses the history. PostgreSQL enforces CHECK. MySQL enforcement started at 8.0.16. A trigger is not required on PostgreSQL for this price rule.',
        },
        {
          option: 'A negative price passes a greater-than check because the sign is stored in a separate column.',
          reason: 'price is one integer. -1 is not greater than 0, so an enforced CHECK (price > 0) rejects the row. There is no hidden sign column in this table.',
        },
      ],
      example: {
        lang: 'ts',
        source: "CREATE TABLE products (\n  id int PRIMARY KEY,\n  price int NOT NULL,\n  CHECK (price > 0)\n);\n\nINSERT INTO products (id, price) VALUES (1, 10);\n\n-- price -1 is rejected where CHECK runs.\n-- PostgreSQL enforces it.\n-- MySQL enforces it from 8.0.16.\n-- Older MySQL stored the bad row.",
      },
      remember: 'CHECK rejects rows that fail the expression. PostgreSQL enforces it. MySQL has enforced it only since 8.0.16.',
    },
  },
  {
    id: 'sql-035',
    tech: 'sql',
    topic: 'modeling',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Which definitions of second normal form and third normal form are the right pair?',
    options: [
      '2NF means no transitive dependency on a non-key column. 3NF means no partial dependency on part of a composite key.',
      '2NF and 3NF mean the same thing: every column is part of the primary key.',
      '2NF means no partial dependency on only part of a composite key. 3NF means no transitive dependency, where a non-key column depends on another non-key column.',
      '3NF means the table has a single-column key. 2NF means the table has a composite key.',
    ],
    correctIndex: 2,
    explanation: {
      answer: '2NF forbids a partial dependency on part of a composite key. 3NF forbids a transitive dependency through a non-key column.',
      why: 'A partial dependency means a non-key column depends on only some of the columns in a composite key, not on the whole key. That breaks second normal form. Example: order lines keyed by (order_id, product_id) should not also store product_name, because the name depends only on product_id. A transitive dependency means a non-key column depends on another non-key column, which depends on the key. That breaks third normal form even when the key is a single column, so 2NF can already hold. Example: employee id determines dept_id, and dept_id determines dept_city, while dept_id is not a key of the employee table. Move the city to a department table. The two forms are not swapped, they are not the same rule, and they are not decided by counting key columns alone.',
      wrong: [
        {
          option: '2NF means no transitive dependency on a non-key column. 3NF means no partial dependency on part of a composite key.',
          reason: 'This pair swaps the names. Partial dependencies are the 2NF problem. Transitive dependencies through a non-key column are the 3NF problem.',
        },
        {
          option: '2NF and 3NF mean the same thing: every column is part of the primary key.',
          reason: 'Putting every column in the key is not the definition of either form. 2NF and 3NF are different rules about what non-key columns may depend on.',
        },
        {
          option: '3NF means the table has a single-column key. 2NF means the table has a composite key.',
          reason: 'A single-column key cannot have a partial dependency, so 2NF is automatic, but the table can still break 3NF. A composite key can be in both forms when every non-key column depends on the whole key and not on another non-key column.',
        },
      ],
      example: {
        lang: 'ts',
        source: "CREATE TABLE products (\n  id int PRIMARY KEY,\n  name varchar(100) NOT NULL\n);\nCREATE TABLE order_lines (\n  order_id int NOT NULL,\n  product_id int NOT NULL,\n  qty int NOT NULL,\n  PRIMARY KEY (order_id, product_id)\n);\n\n-- product name lives on products.\n-- It does not depend on only part of the line key.",
      },
      remember: '2NF: no partial dependency on part of a composite key. 3NF: no transitive dependency on a non-key column.',
    },
  },
  {
    id: 'sql-036',
    tech: 'sql',
    topic: 'modeling',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'The only candidate key is id. The business rule is that dept_id determines dept_city. A review comment says this table breaks second normal form because dept_city depends on part of the key. What is the real problem?',
    code: {
      lang: 'ts',
      source: "CREATE TABLE employees (\n  id int PRIMARY KEY,\n  dept_id int NOT NULL,\n  dept_city varchar(100) NOT NULL,\n  name varchar(100) NOT NULL\n);",
    },
    options: [
      'The comment is right. dept_city depends on part of id, so this is a partial dependency and a 2NF failure.',
      'The table is already in 3NF. A city is allowed to depend on a department column inside the employee row.',
      'The table breaks first normal form because dept_id and dept_city are two columns.',
      'The primary key is one column, so there is no partial dependency and 2NF holds. dept_city depends on dept_id, which is not a key, so the table is not in 3NF. Move the city to a department table.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'This is a third normal form failure, not a second normal form failure. The city depends on dept_id.',
      why: 'Second normal form forbids a partial dependency: a non-key column that depends on only part of a composite key. id is one column, so there is no part of the key for dept_city to depend on. 2NF already holds. Third normal form forbids a transitive dependency, where a non-key column depends on another non-key column. id determines dept_id, and dept_id determines dept_city, but dept_id is not a candidate key of employees because many employees share a department. The city is stored over and over and can disagree between employees in the same department. First normal form is about atomic values, not about having two related columns. The repair is a departments table whose key is dept_id and whose column is city, with employees keeping only dept_id.',
      wrong: [
        {
          option: 'The comment is right. dept_city depends on part of id, so this is a partial dependency and a 2NF failure.',
          reason: 'id has no parts. A partial dependency needs a composite key. The comment uses the 2NF name for a 3NF problem.',
        },
        {
          option: 'The table is already in 3NF. A city is allowed to depend on a department column inside the employee row.',
          reason: 'That dependency is the transitive dependency 3NF removes. Leaving the city on the employee row lets two employees in one department store different cities.',
        },
        {
          option: 'The table breaks first normal form because dept_id and dept_city are two columns.',
          reason: 'First normal form is about values being atomic, not about how many columns a table has. Two columns are fine. The problem is which column determines the city.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "CREATE TABLE departments (\n  id int PRIMARY KEY,\n  city varchar(100) NOT NULL\n);\n\nCREATE TABLE employees (\n  id int PRIMARY KEY,\n  dept_id int NOT NULL,\n  name varchar(100) NOT NULL,\n  FOREIGN KEY (dept_id) REFERENCES departments (id)\n);",
      },
      example: {
        lang: 'ts',
        source: "CREATE TABLE departments (\n  id int PRIMARY KEY,\n  city varchar(100) NOT NULL\n);\nCREATE TABLE employees (\n  id int PRIMARY KEY,\n  dept_id int NOT NULL,\n  name varchar(100) NOT NULL,\n  FOREIGN KEY (dept_id) REFERENCES departments (id)\n);\n\n-- City depends on the department key.\n-- Employees no longer store a transitive city.",
      },
      remember: 'A single-column key can still break 3NF. 2NF is about part of a composite key. 3NF is about a non-key determining another non-key.',
    },
  },
] satisfies Question[];

