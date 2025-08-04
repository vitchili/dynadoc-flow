#!/bin/bash

ZOOKEEPER_HOST="zookeeper:2181"
EXPECTED_BROKER_COUNT=3

echo "Aguardando brokers se registrarem no Zookeeper..."

wait_for_brokers() {
  local count=0

  while [ "$count" -lt "$EXPECTED_BROKER_COUNT" ]; do
    count=$(zookeeper-shell $ZOOKEEPER_HOST ls /brokers/ids 2>/dev/null \
      | grep -oP '\[\K[^\]]*' | tr ',' '\n' | grep -v '^$' | wc -l)

    echo "Brokers registrados no Zookeeper: $count/$EXPECTED_BROKER_COUNT"
    sleep 3
  done

  echo "Todos os brokers estão registrados no Zookeeper!"
}

wait_for_brokers

create_topic() {
  local TOPIC=$1
  local PARTITIONS=$2
  local REPLICATION=$3

  kafka-topics --bootstrap-server kafka1:9092 \
    --topic "$TOPIC" \
    --describe > /dev/null 2>&1

  if [ $? -ne 0 ]; then
    echo "Criando tópico: $TOPIC"
    kafka-topics --create \
      --bootstrap-server kafka1:9092 \
      --replication-factor "$REPLICATION" \
      --partitions "$PARTITIONS" \
      --topic "$TOPIC"
  else
    echo "Tópico $TOPIC já existe."
  fi
}

create_topic "user.logged" 3 3
create_topic "template.requested" 3 3
create_topic "template.delivered" 3 3

echo "Tópico criado com sucesso (ou já existia)."
