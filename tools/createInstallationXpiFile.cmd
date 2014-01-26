
SET XPI_FILE_NAME=hcalendar1.0.6.7-fx+tb.xpi

rem
rem prepare SetupFiles folder
rem
rmdir /S /Q SetupFiles
mkdir SetupFiles
xcopy /E /y ..\sources\*.* SetupFiles\*.*

rem copy zip.exe SetupFiles\chrome\
rem copy create_hcalendar.jar.cmd SetupFiles\chrome\
rem chdir SetupFiles\chrome\
rem call create_hcalendar.jar.cmd
rem chdir ..\..\

rem rmdir /S /Q SetupFiles\chrome\content
rem rmdir /S /Q SetupFiles\chrome\locale
rem rmdir /S /Q SetupFiles\chrome\skin
rem del /Q SetupFiles\chrome\zip.exe
rem del /Q SetupFiles\chrome\create_hcalendar.jar.cmd

copy zip.exe SetupFiles
chdir SetupFiles
zip.exe -r %XPI_FILE_NAME% *.* -x *.exe
chdir ..

dir SetupFiles\%XPI_FILE_NAME%
xcopy /Y SetupFiles\%XPI_FILE_NAME% .\
pause
