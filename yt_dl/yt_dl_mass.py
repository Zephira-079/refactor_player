from pytube import YouTube

print("<------------- textfile name <youtubelinks> ------------->")
file = str(input())
with open(file,'r') as f:
    for i in f.readlines():
        yt = YouTube(i)
        print(yt.title)
        yt.thumbnail_url
        yt.streams.get_audio_only().download("./MaidCat")