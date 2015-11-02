htdocs:
	./make_pre.js
	- ./make_preopt.sh
	./make_links.sh
	./make_html.js
	ln -f template/app.{css,js} htdocs
	ln -f node_modules/permalink/permalink.js htdocs
	touch htdocs

upload:
	rsync -CPaz --delete ~/Hamsters/{pic,pre} animuchan-small:hamsters/htdocs/media
	rsync -CPaz --exclude-from .rsyncignore htdocs other animuchan-small:hamsters

clean:
	rm -rf htdocs

.PHONY: clean upload
