echo "wait db server"
dockerize -wait tcp://db:3306 -timeout 5s

echo "start node server"
node index.js