<template>
  <q-page class="q-pa-lg">
    <h5 class='q-mt-none'>Help - Tutorial</h5>
    <p>My Colors App is an technology to save lists of different colors in your computer.</p>
    <p>First all, you give a name to the list. You create a new item in the list when you type the list name and press enter/return.  Click on the icon search to show colors of the chosen list.</p>
    <p>Type a color's hex code and type enter/return, send a request to https://api.color.pizza/v1 will bring a suggested color's description, you can change and give your own description. More informations about API color's name in website <a href="url">https://github.com/meodai/color-names</a></p>
    <p>After hex code and description was filled, use enter/return or click in the icon plus to insert values to the data table above.</p>
    <p>You visualize a data table in two forms: lines or cards, switching the toggle cards.</p>    <p>The button Save List is important to record data in the local data base.</p>
    <p>You can double-click in the line to delete the color, after the Save List button must be pressed.</p>
  </q-page>
</template>

<script>
export default {
  name: 'Help'
}
</script>
