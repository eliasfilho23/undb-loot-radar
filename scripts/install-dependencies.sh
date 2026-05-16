#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

echo "Installing shared dependencies..."
cd $SCRIPT_DIR/../shared && npm install && npm run build

echo "Installing frontend dependencies..."
cd $SCRIPT_DIR/../frontend && npm install

echo "Installing backend dependencies..."
cd $SCRIPT_DIR/../backend && npm install

echo "Done!"
