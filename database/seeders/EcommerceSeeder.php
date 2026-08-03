<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use RuntimeException;

class EcommerceSeeder extends Seeder
{
    public function run(): void
    {
        $sql = File::get(database_path('latihan_sql_ecommerce_mysql.sql'));

        preg_match_all(
            '/INSERT\s+INTO\s+(customers|products|orders|order_items)\s*\((.*?)\)\s*VALUES\s*(.*?);/is',
            $sql,
            $statements,
            PREG_SET_ORDER,
        );

        if (count($statements) !== 4) {
            throw new RuntimeException('Empat INSERT data dummy ecommerce tidak ditemukan.');
        }

        DB::transaction(function () use ($statements): void {
            $orderDates = [];

            foreach ($statements as $statement) {
                $table = $statement[1];
                $columns = array_map(
                    static fn (string $column): string => trim($column),
                    explode(',', $statement[2]),
                );

                preg_match_all("/\\((?:[^'()]|'(?:''|[^'])*')*\\)/s", $statement[3], $tuples);

                $rows = array_map(function (string $tuple) use ($columns, $table, &$orderDates): array {
                    $values = array_map($this->parseValue(...), str_getcsv(substr($tuple, 1, -1), ',', "'", '\\'));

                    if (count($columns) !== count($values)) {
                        throw new RuntimeException("Data dummy {$table} tidak valid.");
                    }

                    $row = [];

                    foreach ($columns as $index => $column) {
                        $row[$column] = $values[$index];
                    }

                    return $this->addTimestamps($table, $row, $orderDates);
                }, $tuples[0]);

                DB::table($table)->insert($rows);
            }
        });
    }

    private function parseValue(?string $value): string|int|float|null
    {
        if ($value === null) {
            return null;
        }

        $value = trim($value);

        if (strtoupper($value) === 'NULL') {
            return null;
        }

        if (str_starts_with($value, "'") && str_ends_with($value, "'")) {
            return str_replace("''", "'", substr($value, 1, -1));
        }

        if (is_numeric($value)) {
            return str_contains($value, '.') ? (float) $value : (int) $value;
        }

        return $value;
    }

    /**
     * @param  array<string, string|int|float|null>  $row
     * @param  array<int, string>  $orderDates
     * @return array<string, string|int|float|null>
     */
    private function addTimestamps(string $table, array $row, array &$orderDates): array
    {
        if ($table === 'customers') {
            $row['created_at'] = $row['registered_at'];
            $row['updated_at'] = $row['registered_at'];
            unset($row['registered_at']);
        }

        if ($table === 'products') {
            $row['updated_at'] = $row['created_at'];
        }

        if ($table === 'orders') {
            $orderDates[(int) $row['id']] = (string) $row['order_date'];
            $row['created_at'] = $row['order_date'];
            $row['updated_at'] = $row['order_date'];
        }

        if ($table === 'order_items') {
            $timestamp = $orderDates[(int) $row['order_id']];
            $row['created_at'] = $timestamp;
            $row['updated_at'] = $timestamp;
        }

        return $row;
    }
}
