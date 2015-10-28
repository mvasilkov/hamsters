htdocs:
	./make_pre.js
	- ./make_preopt.sh
	./make_links.sh
	./make_html.js
	ln -f template/app.{css,js} htdocs
	ln -f template/view.html htdocs
	ln -f node_modules/jquery/dist/jquery.min.{js,map} htdocs
	touch htdocs

clean:
	rm -rf htdocs

.PHONY: clean
