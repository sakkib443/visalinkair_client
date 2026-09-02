// One definition of "what does this country cost", so the card, the price
// filter and the price sort can't drift apart — they used to compute it three
// different ways, and the sort disagreed with the number on the card.

/**
 * The country's "from" price in BDT, or null when no price is set anywhere.
 *
 * `startingPrice` is what the admin typed and always wins — including 0, which
 * is a real price (a free visa), not "unset". Falling back to the *cheapest*
 * available visa rather than the first one is what "starting price" means; the
 * first visa in the list is just whichever the admin happened to add first.
 */
export const countryFromPrice = (country) => {
    if (country?.startingPrice != null) return country.startingPrice;

    const fees = (country?.visaTypes || [])
        .filter((vt) => vt.isAvailable !== false && vt.fee != null)
        .map((vt) => vt.fee);

    return fees.length ? Math.min(...fees) : null;
};

/** Same value, but safe to sort/compare with — unpriced countries sort last. */
export const countryFromPriceForSort = (country, { unpricedLast = true } = {}) => {
    const price = countryFromPrice(country);
    if (price != null) return price;
    return unpricedLast ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
};
