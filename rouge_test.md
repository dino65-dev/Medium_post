---
layout: default
title: "Rouge Line Numbers Test"
---

# Rouge Line Numbers Test

Testing the Rouge line number implementation to ensure line numbers are properly separated from code content.

## Test Code Block

{% highlight python %}
def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# Test the function
for i in range(10):
    print(f"fib({i}) = {fibonacci(i)}")

# This should show line numbers 1-12 that are:
# - NOT selectable when copying code
# - Visually separated from code content
# - Properly styled with theme colors
{% endhighlight %}

## Expected Behavior

When you select and copy the code above, you should only get the Python code without the line numbers. The line numbers should be:

1. ✅ Visible but not selectable
2. ✅ Properly positioned to the left
3. ✅ Styled with theme-aware colors
4. ✅ Separated by a vertical border

If line numbers appear in your copy/paste, the CSS fix hasn't been applied correctly.
