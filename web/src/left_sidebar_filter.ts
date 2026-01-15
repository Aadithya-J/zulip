import $ from "jquery";
import assert from "minimalistic-assert";

import {Typeahead} from "./bootstrap_typeahead.ts";
import type {TypeaheadInputElement} from "./bootstrap_typeahead.ts";
import * as topic_filter_pill from "./topic_filter_pill.ts";
import type {TopicFilterPill, TopicFilterPillWidget} from "./topic_filter_pill.ts";
import * as typeahead_helper from "./typeahead_helper.ts";

export let left_sidebar_filter_pill_widget: TopicFilterPillWidget | null = null;
export let left_sidebar_filter_typeahead: Typeahead<TopicFilterPill> | undefined;

export function get_topics_state(): string {
    const pills = left_sidebar_filter_pill_widget?.items() ?? [];
    return pills[0]?.syntax ?? "";
}

export function clear_without_updating(): void {
    left_sidebar_filter_pill_widget?.clear(true);
    $("#left-sidebar-filter-query").empty();
}

export function clear_left_sidebar_filter(e: JQuery.Event): void {
    e.stopPropagation();
    left_sidebar_filter_typeahead?.hide();
    left_sidebar_filter_pill_widget?.clear(true);

    const $input = $("#left-sidebar-filter-query");
    $input.empty();
    $("#left-sidebar-filter-input").trigger("input");
    $input.trigger("blur");
}

export function setup_left_sidebar_filter_typeahead(): void {
    left_sidebar_filter_typeahead?.unlisten();
    left_sidebar_filter_typeahead = undefined;
    left_sidebar_filter_pill_widget = null;

    const $input = $("#left-sidebar-filter-query");
    const $pill_container = $("#left-sidebar-filter-input");

    if ($input.length === 0 || $pill_container.length === 0) {
        return;
    }

    left_sidebar_filter_pill_widget = topic_filter_pill.create_pills($pill_container);

    const typeahead_input: TypeaheadInputElement = {
        $element: $input,
        type: "contenteditable",
    };

    const options = {
        source() {
            const $pills = $("#left-sidebar-filter-input .pill");
            if ($pills.length > 0) {
                return [];
            }
            return [...topic_filter_pill.filter_options];
        },
        item_html(item: TopicFilterPill) {
            return typeahead_helper.render_topic_state(item.label);
        },
        matcher(item: TopicFilterPill, query: string) {
            return (
                query.includes(":") &&
                (item.syntax.toLowerCase().startsWith(query.toLowerCase()) ||
                    (item.syntax.startsWith("-") &&
                        item.syntax.slice(1).toLowerCase().startsWith(query.toLowerCase())))
            );
        },
        sorter(items: TopicFilterPill[]) {
            return items;
        },
        updater(item: TopicFilterPill) {
            assert(left_sidebar_filter_pill_widget !== null);
            left_sidebar_filter_pill_widget.clear(true);
            left_sidebar_filter_pill_widget.appendValue(item.syntax);
            $input.text("");
            $input.trigger("focus");
            $("#left-sidebar-filter-input").trigger("input");
            return $input.text().trim();
        },
        stopAdvance: true,
        dropup: true,
    };

    left_sidebar_filter_typeahead = new Typeahead(typeahead_input, options);

    $input.on("keydown", (e: JQuery.KeyDownEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
        } else if (e.key === ",") {
            e.stopPropagation();
        }
    });

    left_sidebar_filter_pill_widget.onPillRemove(() => {
        $("#left-sidebar-filter-input").trigger("input");
    });
}
