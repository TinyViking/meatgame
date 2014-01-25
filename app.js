var koa = require('koa'),
    app = koa(),
    common = require('koa-common'),
    route = require('koa-route');

app.use(common.favicon());
app.use(common.static(__dirname + '/public', {defer: true}));

var server = require('http').Server(app.callback()),
  io = require('socket.io').listen(server);

var model = require('./model')();

model.x = 1;
model.y = 1;

io.sockets.on('connection', function (socket) {
  socket.on('button', function () {
    model.x += 1;
    model.y += 1;
  });
  socket.on('left', function () {
    if (model.x > 1) model.x -= 1;
  });
  socket.on('right', function () {
    model.x += 1;
  });
  socket.on('down', function () {
    model.y += 1;
  });
  socket.on('up', function () {
    if (model.y > 1) model.y -= 1;
  });
});

var resolvePath = require('./lib/resolve-path');

function tick () {
  var changed = model.diff();

  if (changed.length) {
    io.sockets.emit('message', changed.map(function (path) {
      return {
        key: path,
        value: resolvePath(path, model)
      };
    }));
  }
  setTimeout(tick, 16);
}


server.listen(3000);

tick();
