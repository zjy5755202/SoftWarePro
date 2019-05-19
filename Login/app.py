# -*- coding: utf-8 -*-
import tornado.ioloop
import tornado.web
import json
from Ems import Ems


class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.write('It works.')


class EmsHandler(tornado.web.RequestHandler):
    def get(self):
        self.set_header('Content-type', 'application/json')
        self.write(json.dumps(Ems.login(self.get_argument('id'), self.get_argument('password'))))


app = tornado.web.Application([(r'/', IndexHandler),
                               (r'/login', EmsHandler)])

if __name__ == '__main__':
    app.listen(8001)
    tornado.ioloop.IOLoop.instance().start()
