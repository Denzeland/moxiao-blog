

ERROR: Command errored out with exit status 1:
     command: /usr/bin/python3 -c 'import sys, setuptools, tokenize; sys.argv[0] = '"'"'/tmp/pip-install-fpix762c/python-nss/setup.py'"'"'; __file__='"'"'/tmp/pip-install-fpix762c/python-nss/setup.py'"'"';f=getattr(tokenize, '"'"'open'"'"', open)(__file__);code=f.read().replace('"'"'\r\n'"'"', '"'"'\n'"'"');f.close();exec(compile(code, __file__, '"'"'exec'"'"'))' egg_info --egg-base /tmp/pip-install-fpix762c/python-nss/pip-egg-info
         cwd: /tmp/pip-install-fpix762c/python-nss/
    Complete output (9 lines):
    Traceback (most recent call last):
      File "<string>", line 1, in <module>
      File "/tmp/pip-install-fpix762c/python-nss/setup.py", line 409, in <module>
        sys.exit(main(sys.argv))
      File "/tmp/pip-install-fpix762c/python-nss/setup.py", line 333, in main
        nss_include_dir  = find_include_dir(['nss3', 'nss'],   ['nss.h',  'pk11pub.h'], include_roots=include_roots)
      File "/tmp/pip-install-fpix762c/python-nss/setup.py", line 94, in find_include_dir
        raise ValueError("unable to locate include directory containing header files %s" % include_files)
    ValueError: unable to locate include directory containing header files ['nss.h', 'pk11pub.h']
    ----------------------------------------
ERROR: Command errored out with exit status 1: python setup.py egg_info Check the logs for full command output.