# სმარტ აკადემია x Colliers

ერთგვერდიანი სტატიკური ვებგვერდი Colliers-ისთვის სმარტ აკადემიის სპეციალური შეთავაზებით. ასლია BGoffer-ის, Colliers-ის ფერებით (navy #000759, cyan #0C9ED9) და ლოგოთი.

## სტრუქტურა

```
index.html              გვერდის მარკაპი (SVG sprite: ლოგოები და იკონები)
assets/css/style.css    სტილები, light/dark ტოკენები
assets/js/courses.js    კურსების მონაცემები (50 კურსი)
assets/js/app.js        რენდერი, ფილტრი, ძიება, დალაგება, თემის გადართვა
assets/img/             ლოგოები და favicon
```

## მონაცემები

- ფასები: `back_to_academy_-_2026.xlsx`, ფურცელი "ფასდაკლებები - დაააფდეითებული".
  - `price` = გასაყიდი ფასი (დღგ-ს ჩათვლით)
  - `discount` = "BOG ფასები" სვეტი (ფასდაკლება ლარში)
  - საბოლოო ფასი = `price - discount`, პროცენტი = `discount / price`
- ბმულები: `training_details` ცხრილიდან `training_id` + `slug` -> `https://smartacademy.ge/trainings/{training_id}-{slug}`
- სურათები და ლექტორები: smartacademy.ge-ს კურსების ბარათებიდან.
  - `img` = webp ვერსია, `img2` = ორიგინალი png/jpg (კურსის გვერდის og:image).
  - თუ webp ვერ ჩაიტვირთა, იტვირთება `img2`; თუ ისიც ვერა, ჩანს კურსის სახელი ტექსტად.
- `start` - ჯგუფის დაწყების თარიღი; გვერდზე ჩანს მხოლოდ მომავალი თარიღი.

კურსის დასამატებლად ან ფასის შესაცვლელად საკმარისია `assets/js/courses.js`-ის რედაქტირება. `cat` ველის მნიშვნელობები: `it`, `data`, `design`, `marketing`, `management`, `finance`, `hr`.

## გაშვება

სტატიკური საიტია, build არ სჭირდება. ლოკალურად:

```
python3 -m http.server 8000
```
