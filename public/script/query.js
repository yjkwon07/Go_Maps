var search;

document.querySelector('#search').addEventListener('keyup', function (_event) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === xhr.DONE) {
            if (xhr.status === 200) {
                var predictions = JSON.parse(xhr.responseText);
                var ul = document.querySelector('#search-list');
                ul.innerHTML = '';
                predictions.forEach(function (prediction) {
                    var li = document.createElement('li');
                    li.textContent = prediction.terms[0].value;
                    li.onclick = function () {
                        location.href = `/search/${prediction.terms[0].value}`;
                    }
                    ul.appendChild(li);
                });
            } else {
                console.error(xhr.responseText);
            }
        }
    };

    var query = this.value.trim();
    if (search) {
        clearTimeout(search);
    }
    search = setTimeout(function () {
        if (query) {
            xhr.open('GET', '/autocomplete/' + query);
            xhr.send();
        }
    }, 200);
});

document.querySelector('#search-form').addEventListener('submit', function (event) {
    event.preventDefault();
    if (!this.search.value || !this.search.value.trim()) {
        this.search.focus();
        return false;
    }
    if (this.type.value) {
        return location.href = `/search/${this.search.value.trim()}?type=${this.type.value}`;
    }
    this.action = '/search/' + this.search.value.trim();
    return this.submit();
}, { passive: false })