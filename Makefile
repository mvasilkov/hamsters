htdocs:
	./make_pre.js
	- ./make_preopt.sh
	./make_links.sh
	./make_html.js
	ln -f template/app.{css,js} htdocs
	ln -f node_modules/permalink/permalink.js htdocs
	touch htdocs

clean:
	rm -rf htdocs

.PHONY: clean
