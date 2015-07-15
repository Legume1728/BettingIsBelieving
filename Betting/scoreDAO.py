import sys
import json
import random
import string
import time
import pymongo
import yaml

class ScoreDAO:

    def __init__(self, database):
        self.db = database
        self.scores = database.scores

    def enter_score(self, score):
        score['entry_time']=time.time()
        try:
            self.scores.insert(score);
        except pymongo.errors.OperationFailure:
            print "oops, mongo error"
            return False

        return True


    def get_newest(self, _id):
        '''
        gets the newest score.
        '''
        score_cursor= self.scores.find({'user_id':str(_id)}).sort("entry_time", pymongo.DESCENDING).limit(1)#{'id':str(id), 'width':width, 'height':height})
  #      print pic
        l=[]
        for score in score_cursor:
            l.append(score)
        print "latest score: ", l[-1]["score"]

        if not l:
            return None
        else:
            return json.dumps(l[-1]["score"]);
        #return picture['url'] 
