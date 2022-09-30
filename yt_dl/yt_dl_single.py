from pytube import YouTube

print("<------------- video url ------------->")
url = input()
yt = YouTube(url)
print(yt.title)
yt.thumbnail_url 
yt.streams.get_highest_resolution().download("./MaidCat")