﻿
var YouTubePlaylist = function(id, title, videoCountHint, videoOnPlayCallback) {
    var self = this;
    self.id = id;
    self.title = title;
    self.view = null;
    self.videos = [];
    self.videoCountHint = videoCountHint;
    self.videoOnPlayCallback = videoOnPlayCallback;
        
    self.createView = function() {
        var space = $('<td class="space"></td>'),
            select = function(event) {
                    self.viewSelect(event);
                    event.stopPropagation();
                },
            toggle = function(event) {
                self.togglePlaylistView();
                event.stopPropagation();
                };
        
        self.view = $('<tr/>')
            /*.addClass("draggable")*/
            .addClass("playlist")
            .click(select)
            .data('model', self);
        
        
        $('<td class="playlist"></td>')
            .click(toggle)
            .appendTo(self.view);
        space.clone().appendTo(self.view);
        
        var titleElem = $('<td class="title"/>')
            .click(select)
            .text(self.title)
            .appendTo(self.view);
            
        $('<table class="videos"/>')
            .appendTo(titleElem)
            .hide();
        
        space.clone().appendTo(self.view);
                
        $('<td class="videoCountHint"/>')
            .text(self.videoCountHint)
            .appendTo(self.view);
        
        self.view.dblclick(toggle);
        titleElem.dblclick(toggle);
        
        return self.view;
    };
    
    self.viewSelect = function(event) {
        self.view.siblings().removeClass('selected');
        self.view.addClass('selected');
    };
    
    self.togglePlaylistView = function() {
        var videoView = self.view.find('.videos');
        if (self.videos.length) {
            videoView.toggle();
        } else {
            self.view.addClass('loading');
            videoView.show();
            self.loadVideos();
        }
    };
    
    self.loadVideos = function() {
        var start = self.videos.length + 1,
            url = 'http://gdata.youtube.com/feeds/api/playlists/' + self.id + '?start-index='+start+'&max-results=50&v=2&alt=json&callback=?',
            videoView = self.view.find('.videos');
        
        $.getJSON(url, {}, function(data) {
            if (data.feed.entry && data.feed.entry.length > 0) {
                var results = Search.getVideosFromYouTubeSearchData(data);
                self.videos = $.merge(self.videos, results);
                $.each(results, function(i, video) {
                    if (video) {
                        video.onPlayCallback = self.videoOnPlayCallback;
                        video.createListView().appendTo(videoView);
                    }
                });
                self.loadVideos();
            } else {
                self.view.removeClass('loading');
            }
        });
    };
};
