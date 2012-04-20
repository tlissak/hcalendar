
rem
rem prepare SetupFiles folder
rem
rmdir /S /Q SetupFiles
mkdir SetupFiles
xcopy /E /y ..\sources\*.* SetupFiles\*.*

copy zip.exe SetupFiles\chrome\
copy create_hcalendar.jar.cmd SetupFiles\chrome\
chdir SetupFiles\chrome\
call create_hcalendar.jar.cmd
chdir ..\..\

rmdir /S /Q SetupFiles\chrome\content
rmdir /S /Q SetupFiles\chrome\locale
del /Q SetupFiles\chrome\zip.exe
del /Q SetupFiles\chrome\create_hcalendar.jar.cmd

copy zip.exe SetupFiles
chdir SetupFiles
zip.exe -r hcalendar1.0.5.14-fx+fl+mz+ns+tb.xpi *.* -x *.exe
chdir ..

dir SetupFiles\hcalendar1.0.5.14-fx+fl+mz+ns+tb.xpi
xcopy /Y SetupFiles\hcalendar1.0.5.14-fx+fl+mz+ns+tb.xpi .\
pause
