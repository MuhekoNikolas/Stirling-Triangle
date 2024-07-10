/**
 * Class representing a Stirling numbers triangle.
 */
class Stirling_numbers_triangle {
    /**
     * Creates a Stirling numbers triangle instance.
     * @param {number} n - Number of rows.
     * @param {number} k - Number of columns.
     * @param {number} origo_value - Initial value for the origin.
     * @param {number} modulus - Modulus value for calculations.
     */
    constructor(n, k, origo_value=1, modulus=1) {
        this.n = n;
        this.k = k;
        this.origo_value = origo_value;
        this.modulus = modulus;

        // Select the table element and create a style element for additional CSS
        this.table = document.querySelector("table");
        this.extra_css_element = document.createElement('style');
        document.head.appendChild(this.extra_css_element);

        // Flags for custom functions
        this.auto_fill_diagonal_with_custom_function = 0;
        this.auto_fill_horizontal_with_custom_function = 0;

        // Initialize grids
        this.num_values_grid = [
            [this.origo_value]
        ];
        this.num_elements_grid = [];

        // Create the header row and columns
        this.create_header_row();
        this.create_n_col();
    }

    /**
     * Creates the header row for the table.
     */
    create_header_row() {
        this.header_row_el = document.createElement("tr");
        var header_row_blank_child = document.createElement("th");
        this.header_row_el.appendChild(header_row_blank_child);

        for (var x = 0; x < this.k; x++) {
            var this_header_row_child = document.createElement("th");
            this_header_row_child.textContent = `k = ${x}`;
            this.header_row_el.appendChild(this_header_row_child);
        }

        this.table.appendChild(this.header_row_el);
    }

    /**
     * Creates columns for each row up to n.
     */
    async create_n_col() {
        for (var x = 0; x < this.n; x++) {
            var this_row_el = document.createElement("tr");

            var this_row_n_child = document.createElement("td");
            this_row_n_child.textContent = `n = ${x}`;
            this_row_el.appendChild(this_row_n_child);

            this.table.appendChild(this_row_el);

            for (var y = 0; y < this.k; y++) {
                if (y - 1 == x) {
                    break;
                }

                var this_row_child = document.createElement("td");

                var this_row_el_col = this.num_elements_grid[x] || [];
                this.num_elements_grid[x] = this_row_el_col;
                this.num_elements_grid[x][y] = this_row_child;

                this_row_child.classList.add(`n${x}_k${y}`);
                this_row_el.appendChild(this_row_child);

                var this_row_child_html = this.get_val_for_td(x, y);
                this_row_child.textContent = `${this_row_child_html}`;

                await this.update_td_sequence_names(x, y);
            }
        }
    }

    /**
     * Gets the element value at a specific coordinate.
     * @param {number} n - The row index.
     * @param {number} k - The column index.
     * @returns {HTMLElement} The HTML element at the given coordinates.
     */
    get_element_value_at_coord(n, k) {
        return this.num_elements_grid[n][k];
    }

    /**
     * Calculates the sum of nodes met in a given direction.
     * @param {string} direction - The direction of the ray (left, top, or left_diagonal).
     * @param {number} _n - The starting row index.
     * @param {number} _k - The starting column index.
     * @param {number} length - The length of the ray.
     * @returns {number} The sum of the nodes met.
     */
    throw_ray_and_get_sum_of_met_nodes(direction, _n, _k, length) {
        var sum = this.get_numbers_in_sequence(direction, _n, _k, length).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        return sum;
    }

    /**
     * Retrieves the numbers in a sequence from a specific direction.
     * @param {string} direction - The direction of the sequence (left, top, or left_diagonal).
     * @param {number} _n - The starting row index.
     * @param {number} _k - The starting column index.
     * @param {number} length - The length of the sequence.
     * @param {boolean} return_el_array - Whether to return the element array.
     * @returns {Array} The numbers in the sequence or the element array.
     */
    get_numbers_in_sequence(direction, _n, _k, length, return_el_array = false) {
        var nodes_array = [];
        var nums_array = [];

        if (direction == "left") {
            for (var _ = 0; _ < length; _) {
                var new_k = (_k - 1) - _;

                if (new_k < 0) {
                    break;
                }

                var el_at_this_k = this.get_element_value_at_coord(_n, new_k);

                if (el_at_this_k) {
                    nodes_array.unshift(el_at_this_k);
                    nums_array.unshift(this.num_values_grid[_n][new_k]);
                } else {
                    break;
                }
            }

        } else if (direction == "top") {
            for (var _ = 0; _ < length; _) {
                var new_n = (_n - 1) - _;

                if (new_n < 0) {
                    break;
                }

                var el_at_this_n = this.get_element_value_at_coord(new_n, _k);

                if (el_at_this_n != null) {
                    nodes_array.unshift(el_at_this_n);
                    nums_array.unshift(this.num_values_grid[new_n][_k]);
                } else {
                    break;
                }
            }
        } else if (direction == "left_diagonal") {
            for (var _ = 0; _ < length; _) {
                var new_n = (_n - 1) - _;
                var new_k = (_k - 1) - _;

                if ((new_n < 0) || (new_k < 0)) {
                    break;
                }

                var el_at_this_n = this.get_element_value_at_coord(new_n, new_k);

                if (el_at_this_n) {
                    nodes_array.unshift(el_at_this_n);
                    nums_array.unshift(this.num_values_grid[new_n][new_k]);
                } else {
                    console.log(new_n, new_k, "pppppp", _n, _k, el_at_this_n, this.get_element_value_at_coord(new_n, new_k));
                    break;
                }
            }
        }

        if (return_el_array == true) {
            return [nums_array, nodes_array];
        }

        return nums_array;
    }

    /**
     * Gets the value for a table cell.
     * @param {number} n - The row index.
     * @param {number} k - The column index.
     * @returns {number} The value for the table cell.
     */
    get_val_for_td(n, k) {
        var valToReturn = 0;

        if (n == 0 && k == 0) {
            valToReturn = this.num_values_grid[0][0];
            return valToReturn;
        } else {
            var l = 1; // this.n // 10
            var sum_at_left = this.throw_ray_and_get_sum_of_met_nodes("left", n, k, l);
            var sum_at_top = this.throw_ray_and_get_sum_of_met_nodes("top", n, k, l);
            var sum_at_left_diagonal = this.throw_ray_and_get_sum_of_met_nodes("left_diagonal", n, k, l);

            valToReturn = (sum_at_left_diagonal + sum_at_top);

            if (n == k) {
                if (this.auto_fill_diagonal_with_custom_function == true) {
                    valToReturn = this.diagonal_function(n, k);
                }
            } else if (k == 0) {
                if (this.auto_fill_horizontal_with_custom_function == true) {
                    valToReturn = valToReturn = this.horizontal_function(n, k);
                }
            }

            var this_col = this.num_values_grid[n] || [];
            this.num_values_grid[n] = this_col;
            this.num_values_grid[n][k] = valToReturn;
        }

        return valToReturn; // % this.modulus
    }

    /**
     * Updates the sequence names for a table cell.
     * @param {number} n - The row index.
     * @param {number} k - The column index.
     */
    async update_td_sequence_names(n, k) {
        var this_td_items_at_top = this.get_numbers_in_sequence("top", n, k, Infinity, true);
        var this_td_items_at_left = this.get_numbers_in_sequence("left", n, k, Infinity, true);
        var this_td_items_at_diagonal = this.get_numbers_in_sequence("left_diagonal", n, k, Infinity, true);

        var this_row_el = this.get_element_value_at_coord(n, k);

        var this_td_sequence_at_top = await oes_api.fetch_oes_sequence(this_td_items_at_top[0].concat([Number(this_row_el.textContent)]));
        var this_td_sequence_at_left = await oes_api.fetch_oes_sequence(this_td_items_at_left[0].concat([Number(this_row_el.textContent)]));
        var this_td_sequence_at_diagonal = await oes_api.fetch_oes_sequence(this_td_items_at_diagonal[0].concat([Number(this_row_el.textContent)]));

        if (this_td_sequence_at_top) {
            this_row_el.classList.add("has_sequence_on_top");
            this.showcase_td_sequence("top", this_td_sequence_at_top, this_td_items_at_top[1], this_row_el);
        }

        if (this_td_sequence_at_left) {
            this_row_el.classList.add("has_sequence_on_left");
            this.showcase_td_sequence("left", this_td_sequence_at_left, this_td_items_at_left[1], this_row_el);
        }

        if (this_td_sequence_at_diagonal) {
            this_row_el.classList.add("has_sequence_on_diagonal");
            this.showcase_td_sequence("diagonal", this_td_sequence_at_diagonal, this_td_items_at_diagonal[1], this_row_el);
        }
    }

    /**
     * Adds CSS to the page.
     * @param {string} css - The CSS string to add.
     */
    addCssToPage(css) {
        this.extra_css_element.innerHTML += `${css}`;
    }

    /**
     * Showcases the sequence for a table cell.
     * @param {string} direction - The direction of the sequence (top, left, or diagonal).
     * @param {Object} sequence_info - Information about the sequence.
     * @param {Array} sequence_elements - The elements of the sequence.
     * @param {HTMLElement} row_el - The table cell element.
     */
    showcase_td_sequence(direction, sequence_info, sequence_elements, row_el) {
        var sequence_info_data = sequence_info.data;

        var this_sequence_id = `seq_${sequence_info_data.number}_${crypto.randomUUID().slice(0, 8)}`;
        var this_sequence_name = sequence_info_data.name;

        row_el.classList.add("has_sequence_el");
        row_el.classList.add(this_sequence_id);

        row_el.sequence_ids = row_el.sequence_ids || {};
        row_el.sequence_ids[`${direction}`] = this_sequence_id;

        row_el.sequence_elements = row_el.sequence_elements || {};
        row_el.sequence_elements[`${direction}`] = sequence_elements;

        if (Boolean(row_el?.created_sequences_name_container) == false) {
            var this_row_el_sequences_container = $(`
            <div class='sequence_names_container'>
                <p class="sequence_names_container_direction_el">
                    Top: 
                    <a class="top_sequence_el_data" target="_blank"></a>
                </p>
                <p class="sequence_names_container_direction_el">
                    Left: 
                    <a class="left_sequence_el_data" target="_blank"></a>
                </p>
                <p class="sequence_names_container_direction_el">
                    Diagonal: 
                    <a class="diagonal_sequence_el_data" target="_blank"></a>
                </p>
            </div>
            `)[0];

            var this_row_el_client_rect = row_el.getBoundingClientRect();
            this_row_el_sequences_container.style.top = `${this_row_el_client_rect.y + document.documentElement.scrollTop}px`;
            this_row_el_sequences_container.style.left = `${(this_row_el_client_rect.x + this_row_el_client_rect.width) + document.documentElement.scrollLeft}px`;

            row_el.created_sequences_name_container = true;
            row_el.sequence_el_container = this_row_el_sequences_container;

            row_el.appendChild(row_el.sequence_el_container);
        }

        var this_sequence_el_container_direction_el = $(row_el.sequence_el_container).find(`.${direction}_sequence_el_data`)[0];
        this_sequence_el_container_direction_el.textContent = this_sequence_name;
        this_sequence_el_container_direction_el.setAttribute("href", `https://oeis.org/search?q=${sequence_info_data.data}&language=english&go=Search`);

        // row_el.setAttribute(`data-${direction}-seq-name`, this_sequence_name)

        $(row_el).hover((() => {
            var this_row_el_client_rect = row_el.getBoundingClientRect();
            row_el.sequence_el_container.style.top = `${this_row_el_client_rect.y + document.documentElement.scrollTop}px`;
            row_el.sequence_el_container.style.left = `${(this_row_el_client_rect.x + this_row_el_client_rect.width) + document.documentElement.scrollLeft}px`;

            $(row_el).addClass("highlight_main_sequence_el");
            $(`.${row_el.sequence_ids[`${direction}`]}`).addClass("highlight_sequence");
            $(row_el.sequence_elements[`${direction}`]).addClass(["highlight_sequence", direction]);
        }),

            () => {
                $(row_el).removeClass("highlight_main_sequence_el");
                $(`.${row_el.sequence_ids[`${direction}`]}`).removeClass("highlight_sequence");
                $(row_el.sequence_elements[`${direction}`]).removeClass(["highlight_sequence", direction]);
            }
        );
    }

    /**
     * Custom function for calculating the diagonal value.
     * @param {number} n - The row index.
     * @param {number} k - The column index.
     * @returns {number} The calculated diagonal value.
     */
    diagonal_function(n, k) {
        // Binomial coefficients
        return n - 1;
    }

    /**
     * Custom function for calculating the horizontal value.
     * @param {number} n - The row index.
     * @param {number} k - The column index.
     * @returns {number} The calculated horizontal value.
     */
    horizontal_function(n, k) {
        // Binomial coefficients
        // return 1
        return n;
    }
}
