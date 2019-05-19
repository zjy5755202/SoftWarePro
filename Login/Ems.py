# -*- coding: utf-8 -*-
from keras.models import load_model
from lxml import etree
import numpy as np
import cv2
import pickle
import requests
import re
import hashlib
import time


class Ems(object):

    labels = pickle.load(open(r'model/labels.dat', 'rb'))
    model = load_model(r'model/model.hdf5')
    session = requests.Session()

    @staticmethod
    def join_rect(rect1, rect2):
        if rect1[0] > rect2[0]:
            x = rect2[0]
            w = max(rect2[2], rect1[0] - rect2[0] + rect1[2])
        else:
            x = rect1[0]
            w = max(rect1[2], rect2[0] - rect1[0] + rect2[2])
        if rect1[1] > rect2[1]:
            y = rect2[1]
            h = max(rect2[3], rect1[1] - rect2[1] + rect1[3])
        else:
            y = rect1[1]
            h = max(rect1[3], rect2[1] - rect1[1] + rect2[3])
        return x, y, w, h

    @staticmethod
    def color_filter(bgr_img):
        # 筛选噪点、画出字符轮廓合并输出最后的二值化字符图像
        upper_not_red_bgr = np.array([255, 255, 120])
        lower_not_red_bgr = np.array([0, 0, 0])
        bgr_filter_res = cv2.inRange(bgr_img, lower_not_red_bgr, upper_not_red_bgr)
        hsv_img = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2HSV)
        upper_s_hsv = np.array([180, 255, 255])
        lower_s_hsv = np.array([0, 150, 0])
        hsv_filter_res = cv2.inRange(hsv_img, lower_s_hsv, upper_s_hsv)
        filter_res = cv2.subtract(hsv_filter_res, bgr_filter_res)
        return filter_res

    @staticmethod
    def split_characters(binary_img):
        # 分离出字符的像素块
        contours, hierarchy = cv2.findContours(binary_img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        filter_res = binary_img
        rectangles = []
        individual_flags = []
        for contour in contours:
            rect = cv2.boundingRect(contour)
            if cv2.contourArea(contour) < 0.5:
                cv2.rectangle(filter_res, (rect[0], rect[1]), (rect[0] + rect[2], rect[1] + rect[3]), 0, -1)
            else:
                rectangles.append(rect)
                if cv2.contourArea(contour) < 8:
                    individual_flags.append(False)
                else:
                    individual_flags.append(True)
        merged_rectangles = []
        used_rect_index = []
        for flag_index, flag in enumerate(individual_flags):
            if not flag:
                rect_to_merge = rectangles[flag_index]
                test_x_middle_point = rect_to_merge[0] + rect_to_merge[2] / 2
                merge_index = flag_index
                min_distance = 100
                for rect_index, rect in enumerate(rectangles):
                    if flag_index != rect_index:
                        candidate_x_middle_point = rect[0] + rect[2] / 2
                        distance = abs(test_x_middle_point - candidate_x_middle_point)
                        if distance < min_distance:
                            min_distance = distance
                            merge_index = rect_index
                merged_rectangles.append(Ems.join_rect(rect_to_merge, rectangles[merge_index]))
                used_rect_index.append(flag_index)
                used_rect_index.append(merge_index)
        for rect_index, rect in enumerate(rectangles):
            if rect_index not in used_rect_index:
                merged_rectangles.append(rect)
        characters = []
        merged_rectangles.sort()
        for rect in merged_rectangles:
            characters.append(binary_img[rect[1]:rect[1] + rect[3], rect[0]:rect[0] + rect[2]])
        return characters

    @staticmethod
    def normalize_characters(characters):
        # 等比放大到最大边达到28像素
        normalized_characters = []
        for character in characters:
            width = character.shape[1]
            height = character.shape[0]
            if height > width:
                normalized_character = cv2.resize(character, None, fx=28.0 / height, fy=28.0 / height, interpolation=cv2.INTER_NEAREST)
                padding = np.zeros((28, 28 - normalized_character.shape[1]), dtype=normalized_character.dtype)
                normalized_character = np.hstack((normalized_character, padding))
            else:
                normalized_character = cv2.resize(character, None, fx=28.0 / width, fy=28.0 / width, interpolation=cv2.INTER_NEAREST)
                padding = np.zeros((28 - normalized_character.shape[0], 28), dtype=normalized_character.dtype)
                normalized_character = np.vstack((normalized_character, padding))
            normalized_characters.append(normalized_character)
        normalized_characters = np.array(normalized_characters)
        return normalized_characters

    @staticmethod
    def pre_process(bgr_img):
        filter_res = Ems.color_filter(bgr_img)
        characters = Ems.split_characters(filter_res)
        if len(characters) == 4:
            normalized_characters = Ems.normalize_characters(characters)
            return normalized_characters, True
        else:
            return [], False

    @staticmethod
    def process():
        response = Ems.session.get('http://210.42.121.241/servlet/GenImg')
        # 获取验证码
        image = np.asarray(bytearray(response.content), dtype="uint8")  
        image = cv2.imdecode(image, cv2.IMREAD_COLOR)
        # 读取验证码并分割字符
        letter_images, success = Ems.pre_process(image)
        # 对单个字符进行预测
        if success:
            predictions = []
            for letter_image in letter_images:
                letter_image = np.expand_dims(letter_image, axis=2)
                letter_image = np.expand_dims(letter_image, axis=0)
                prediction = Ems.model.predict(letter_image)
                letter = Ems.labels.inverse_transform(prediction)[0]
                predictions.append(letter)
            captcha_text = ''.join(predictions)
            return captcha_text
        else:
            return Ems.process()

    @staticmethod
    def login(id, password):
        data = {
            'id': id,
            'pwd': hashlib.md5(password.encode()).hexdigest(),
            'xdvfb': ''
        }
        flag = False
        for i in range(5):
            # 获取Cookie和验证码
            captcha = Ems.process()
            data['xdvfb'] = captcha
            response = Ems.session.post('http://210.42.121.241/servlet/Login', data=data, allow_redirects=False) 
            if response.text == '':
                flag = True
                break
        if not flag:
            return {
                'state': False,
                'data': None
            }
        response = Ems.session.get('http://210.42.121.241/stu/student_information.jsp')
        html = etree.HTML(response.text)
        td = html.xpath('//td/text()')
        return {
            'state': True,
            'data': {
                'name': td[1],
                'gender': td[2],
                'grade': td[8],
                'school': td[6],
                'major': td[7],
            }
        }
