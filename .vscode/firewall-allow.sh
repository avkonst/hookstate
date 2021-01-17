#!/bin/bash
sudo ufw allow from $(echo $SSH_CLIENT | awk '{print $1}') to any
