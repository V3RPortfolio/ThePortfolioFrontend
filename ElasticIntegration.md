## Displaying Log Metrics in Dashboard

**Application Path:** admin/
**Application Type:** React with Typescript


Today we are going to write some typescript code that contains:
1. Elasticsearch DSL query
2.Function that parses the elasticsearch response to extract data
3. Typescript interfaces to parse the response

The file #file:elasticsearch.service.ts contains the code to send query and aggregation requests to elasticsearch.

The file #file:elasticsearch.interface.ts contains the interface related to the response of search and aggregation endpoints.

The file #file:fetchIndices.ts contains a sample file that contains a query, response interfaces, and the response parsers.

The folder #file:queries will contain all elasticsearch queries

The mapping provided below beloings to the Elasticsearch indices that we will be querying

### Elasticsearch Mapping (Index: process_executions)

```json
{
  "properties": {
    "cpu_usage": {
      "type": "float"
    },
    "device_id": {
      "type": "keyword"
    },
    "executed_by": {
      "type": "keyword"
    },
    "memory_megabytes": {
      "type": "float"
    },
    "memory_usage": {
      "type": "float"
    },
    "process_name": {
      "type": "keyword"
    },
    "timestamp": {
      "type": "date",
      "format": "strict_date_optional_time"
    }
  }
}
```

### Elasticsearch Mapping (Index: process_tree)

```json
{
  "properties": {
    "device_id": {
      "type": "keyword"
    },
    "executed_command": {
      "type": "text"
    },
    "parent_pid": {
      "type": "keyword"
    },
    "pid": {
      "type": "keyword"
    },
    "process_name": {
      "type": "keyword"
    },
    "timestamp": {
      "type": "date",
      "format": "strict_date_optional_time"
    }
  }
}
```

### Elastisearch Mapping (Index: io_devices)

```json
{
  "properties": {
    "device_id": {
      "type": "keyword"
    },
    "io_device_manufacturer": {
      "type": "keyword"
    },
    "io_device_name": {
      "type": "keyword"
    },
    "io_device_vendor": {
      "type": "keyword"
    },
    "io_interfaces": {
      "type": "nested",
      "properties": {
        "interface_class": {
          "type": "keyword"
        },
        "interface_protocol": {
          "type": "keyword"
        }
      }
    },
    "io_product_information": {
      "type": "keyword"
    },
    "timestamp": {
      "type": "date",
      "format": "strict_date_optional_time"
    }
  }
}
```

