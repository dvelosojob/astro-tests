#!/bin/bash

container=$1
timeout=${2:-30}
wait=${3:-500}

interval=$(echo "scale=2; $wait/1000"|bc -l);

printHelp() {
	echo
	echo "HELP for 'wait-for-healthy-container.sh'"
	echo "usage:"
	echo "./wait-for-healthy-container.sh <container name> <seconds to wait> <milliseconds between retries>"
	echo "The final two options, wait & retry, are optional and will default to 30 & 500 respectively."
	echo
	exit 0
}

if [ -z "$container" ] || [ "$container" == "help" ] || [ "$container" == "-h" ] || [ "$container" == "-?" ] || [ "$container" == "--h" ]
then
	printHelp
fi

echo "Waiting up to $timeout seconds for container: $container to be healthy."

checkForStatus(){
  printf "."
  result=`docker ps --filter 'health=healthy' --filter "name=$container" --format '{{.Names}}'`
  if [[ "$result" == "$container" ]]
	then
		found="true"
	fi
}

start=$SECONDS
run="true"
found="false"

while [ "$run" = "true" ]
do
	checkForStatus

	if [[ "$found" == "true" ]]
	then
		run="false"
		echo "$container is ready after $SECONDS seconds."
	fi

	sleep $interval

	if (( $SECONDS > $timeout))
	then
		run="false"
		echo "ERROR:  Timeout occurred after waiting $timeout seconds for $container"
		exit -5
	fi
done
