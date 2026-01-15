import $ from "jquery";

$("body").on(
    "click",
    ".filter-input .input-close-filter-button",
    function (this: HTMLElement, _e: JQuery.Event) {
        const $input = $(this).prev(".input-element");
        if ($input.is("input, textarea")) {
            $input.val("").trigger("input");
            $input.trigger("blur");
            return;
        }

        const $contenteditable = $input.find<HTMLElement>(".input[contenteditable='true']");
        if ($contenteditable.length > 0) {
            $input.find(".pill .exit").trigger("click");
            $contenteditable.empty();
            $input.trigger("input");
            $contenteditable.trigger("input");
            $contenteditable.trigger("blur");
            return;
        }
    },
);
