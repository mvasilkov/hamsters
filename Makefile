htdocs:
	./make_pre.js
	./make_links.sh
	./make_html.js
	ln -f template/app.css htdocs
	touch htdocs

clean:
	rm -rf htdocs

.PHONY: clean
