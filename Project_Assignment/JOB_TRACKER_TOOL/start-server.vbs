Dim objShell
Set objShell = CreateObject("WScript.Shell")
objShell.CurrentDirectory = "c:\Users\Hema Rajanna\Desktop\AI\Project_Assignment\JOB_TRACKER_TOOL"
objShell.Run "python -m http.server 3000", 0, False
