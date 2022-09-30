import os
print("folder_name")
folderName = str(input())
for i in os.listdir(folderName):
    with open("file_listpy.txt",'a') as wf:
        wf.write('\"' + i.strip() + '\",\n')