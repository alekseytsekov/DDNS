
let msgHandler = {};

window.addEventListener('load', function () {
    // messages
    $('.msg').click(onMsgClick);
    $('.msg-result').click(onMsgClick);

    function onMsgClick() {
        $(this).hide();
    }

    function showSuccessMsg(text) {
        $('.success-msg').html(text);
        $('.success-msg').removeClass('hide-me');
        $('.success-msg').show();
    }

    function showErrorMsg(text) {
        $('.error-msg').text(text);
        $('.error-msg').removeClass('hide-me');
        $('.error-msg').show();
    }

    msgHandler.showSuccessMsg = showSuccessMsg;
    msgHandler.showErrorMsg = showErrorMsg;
})