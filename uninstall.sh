#!/bin/bash

echo "Stoping and removing service..."
systemctl stop empiot-server.service
systemctl disable empiot-server.service
rm /lib/systemd/system/empiot-server.service
echo "Removing files..."
rm -rf /opt/empiot-server
echo "Done!"
