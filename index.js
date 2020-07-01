/**
 * Usage from CLI:
 *
 * node index.js --math="f(a,b,c) = (a^2+b^2+c^2)^3"
 * node index.js --math="u=\frac{-y}{x^2+y^2}\,,\quad v=\frac{x}{x^2+y^2}\,,\quad w=0\,."
 * node index.js --math="e^x=1+x+\frac{x^2}{2}+\frac{x^3}{6}+\cdots=\sum_{n\geq0}\frac{x^n}{n!}"
 * node index.js --math="\int_a^bu\frac{d^2v}{dx^2}\,dx=\left.u\frac{dv}{dx}\right|_a^b-\int_a^b\frac{du}{dx}\frac{dv}{dx}\,dx."
 */

const puppeteer = require('puppeteer');
const argv = require('yargs-parser')(process.argv.slice(2));

if (!argv.math) {
  console.error('Error: --math value required');
  process.exit(1);
}

const html = `<!DOCTYPE html>
<!-- KaTeX requires the use of the HTML5 doctype. Without it, KaTeX may not render properly -->
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous">

    <!-- The loading of KaTeX is deferred to speed up page rendering -->
    <script src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js" integrity="sha384-y23I5Q6l+B6vatafAwxRu/0oK/79VlbSz7Q9aiSZUvyWYIYsd+qj+o24G5ZU2zJz" crossorigin="anonymous"></script>

    <!-- To automatically render math in text elements, include the auto-render extension: -->
    <script src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/contrib/auto-render.min.js" integrity="sha384-kWPLUVMOks5AQFrykwIup5lo0m3iMkkHrD0uJ4H5cjeGihAutqP0yW0J6dpFiVkI" crossorigin="anonymous"
        onload="renderMathInElement(document.body);"></script>
    <style>
      .katex { font-size: 48px !important; } 
    </style>
  </head>
  <span id="mykatex" style="display: inline-block;">...</span>
  <script>
    katex.render(String.raw\`${argv.math}\`, mykatex);
  </script>
</html>`;

const main = async () => {
  let browser;
  try {
    // Launch Puppeteer and setup a new page
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Tell Puppeteer to load our HTML variable.
    // Wait until "networkidle0", which from the
    // docs means "consider navigation to be finished
    // when there are no more than 0 network connections
    // for at least 500 ms."
    await page.goto(`data:text/html,${html}`, { waitUntil: 'networkidle0' });

    // Wait for the <span id="mykatex" /> element to be visible
    // and assign it to "element".
    const element = await page.$('#mykatex');

    // Create a screenshot and save it locally to "math.png"
    await element.screenshot({ path: 'math.png' });
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
};

main();
