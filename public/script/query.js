var search;

document.querySelector('#search').addEventListener('keyup', function (_event) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.status === 200) {
            if (!xhr.responseText) return;
            var { predictions } = JSON.parse(xhr.responseText);
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
}, { passive: false });

document.querySelector('#loc-search-btn').addEventListener('click', function (event) {
    event.preventDefault();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var search = document.querySelector('#search');
            var type = document.querySelector('#type').value;
            if (!search.value || !search.value.trim()) {
                alert('검색명을 기입해 주세요.');
                search.focus();
                return false;
            }
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            location.href = `/search/${search.value.trim()}?lat=${lat}&lng=${lng}&type${type}`;
        }, function () {
            alert('내 위치 확인 권한을 허용하세요.');
        }, {
            // 정확한 위치를 파악할 것인가? (베터리 소모가 많이 든다.)
            enableHighAccuracy: false,
            maximumAge: 0,
            // 요청을 얼마동안 기다릴 것인가?
            timeout: Infinity
        });
    } else {
        alert('GPS를 지원하지 않습니다');
    }
}, { passive: false });