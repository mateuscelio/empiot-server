#!/bin/bash

# exit when any command fails
set -e

echo -n "Copying files to /opt/empiot-server..."
mkdir /opt/empiot-server
cp -r ./* /opt/empiot-server && echo "Ok"

echo -n "Copying service file..."
cp ./empiot-server.service /lib/systemd/system/ && echo "Ok"
echo -n "Reloading systemctl daemon..."
systemctl daemon-reload && echo "Ok"
echo "Enabling service..."
systemctl enable empiot-server.service && echo "Ok"
echo -n "Starting service..."
systemctl start empiot-server.service && echo "Ok"
echo "Done!"
