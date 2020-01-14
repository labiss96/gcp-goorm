main

```
<div class="container">
      <h1><%= title %></h1>
      <p>Welcome to <%= title %> with Firebase</p>
      <a href="/goorm/goormList">GoormList</a>

      <% for(var i=0; i<rows.length; i++) { %>
        <%= rows[i].grmName %>
      <% } %>

</div>
```



