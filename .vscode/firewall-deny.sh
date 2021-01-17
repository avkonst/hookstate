#!/bin/bash
sudo ufw delete $(sudo ufw status numbered | grep 3000 | sed -r --expression="s/[\[][^0-9]*([0-9]+).*/\1/g")
